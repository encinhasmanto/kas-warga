// ---- INITIALIZATION SUPABASE ----
// import { createClient } from '@supabase/supabase-js';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseURL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";
const supabase = createClient(supabaseURL, supabaseKey);

// Subscribe to changes in the 'transactions' and 'payment_tracker' table
supabase
  .channel("transaction-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "transactions",
    },
    (payload) => {
      console.log("Change received!", payload);

      fetchTransactionsFromSupabase();
    }
  )
  .subscribe();

supabase
  .channel("payment-tracker-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "payment_tracker" },
    (payload) => {
      console.log("Payment tracker changed:", payload);

      fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
    }
  )
  .subscribe();

// ---- BALANCE and TRANSACTIONS ----
// ---- SETUP LOCAL STORAGE - BALANCE & TRANSACTIONS ----
// DECLARE localStorage variables for balance and transactions
let balance = localStorage.getItem("balance") || 0;
let localTransaction =
  JSON.parse(localStorage.getItem("localTransaction")) || [];

// For tracking synced transactions by time
const syncedTimes = new Set(
  JSON.parse(localStorage.getItem("syncedTimes")) || []
);

function saveTransactionData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("localTransaction", JSON.stringify(localTransaction));

  async function addTransactionToSupabase(transaction) {
    // Skip if already synced by time
    if (syncedTimes.has(transaction.time)) return;

    const { data, error } = await supabase.from("transactions").insert([
      {
        type: transaction.type,
        amount: transaction.amount,
        time: transaction.time,
        detail: transaction.detail,
      },
    ]);

    if (error) {
      console.error("Insert failed:", error);
    } else {
      console.log(
        "Saved to Supabase:",
        transaction.detail,
        transaction.amount,
        data
      );
      transaction.synced = true; // Mark as synced
      syncedTimes.add(transaction.time); // Add to set
      localStorage.setItem("syncedTimes", JSON.stringify([...syncedTimes])); // Save set
      localStorage.setItem(
        "localTransaction",
        JSON.stringify(localTransaction)
      );
    }
  }

  // Deduplicate: only sync transactions whose time is not in syncedTimes and are the first occurrence in localTransaction
  const uniqueToSync = localTransaction.filter(
    (tx, idx, arr) =>
      !syncedTimes.has(tx.time) &&
      arr.findIndex((t) => t.time === tx.time) === idx
  );
  uniqueToSync.forEach((transaction) => {
    addTransactionToSupabase(transaction);
    console.log("Syncing transaction:", transaction);
  });

  updateUI();
}

// ---- FETCH TRANSACTIONS FROM SUPABASE ----
async function fetchTransactionsFromSupabase() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("time", { ascending: true }); // Get most recent first

  if (error) {
    console.error("Error fetching data:", error);
    return data;
  }

  // Update local transactions array
  localTransaction = data;

  // Update syncedTimes to match all transaction times from Supabase
  const allTimes = localTransaction.map((tx) => tx.time);
  const uniqueTimes = Array.from(new Set(allTimes));
  syncedTimes.clear();
  uniqueTimes.forEach((t) => syncedTimes.add(t));
  localStorage.setItem("syncedTimes", JSON.stringify([...syncedTimes]));

  // Update balance
  balance = 0;
  localTransaction.forEach((tx) => {
    if (tx.type === "Deposit") {
      balance += tx.amount;
    } else if (tx.type === "Withdraw") {
      balance += tx.amount;
    }
  });

  // Save to localStorage
  localStorage.setItem("localTransaction", JSON.stringify(localTransaction));
  localStorage.setItem("balance", balance);

  // Refresh UI
  updateUI();
}

// ----------------------------------------------------

// ---- IURAN STATUS ----
function loadIuranData() {
  const stored = localStorage.getItem("iuranStatusByYear");
  iuranStatusByYear = stored ? JSON.parse(stored) : {};
}

// Migrate old string transactions to object format (optional, safe to remove after first run) => setting awal untuk masukan transaksi agar jadi object
if (localTransaction.length && typeof localTransaction[0] === "string") {
  localTransaction = localTransaction.map((str) => ({
    type: str.startsWith("Deposit") ? "Deposit" : "Withdraw",
    amount: parseInt(str.replace(/\D/g, "")),
    detail: "",
  }));
}

// Add thousand separator to amount input
// removes any non-digit characters, then inserts a dot (.) every 3 digits (e.g., 1000 becomes 1.000)
const amountInput = document.getElementById("amount");
const detailInput = document.getElementById("detail");
if (amountInput) {
  amountInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  });
}

// Format currency => kuncinya ada di formatCurrency dan style "currency"
function formatCurrency(amount) {
  return Number(amount).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
}

function formatDate(date) {
  // Format: 07/06/2025 14:30 => format tanggal dan waktu disesuaikan dengan lokal Indonesia => toLocalStrung ("id-ID")
  const d = new Date(date);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- UPDATE UI ----
// update the UI in real-time as new transactions are added or the balance changes.
const updateUI = function () {
  document.getElementById("balance").textContent = formatCurrency(balance);
  const list = document.getElementById("transactionsHistory");
  list.innerHTML = "";

  // Fetch transactions from Supabase and update local data, then update UI

  // Get the last 10 transactions (most recent first) and loop through them. Without older and later button
  const latest = localTransaction.slice(-10).reverse();
  latest.forEach((item) => {
    const isDeposit = item.type === "Deposit";
    const mainColor = isDeposit ? "#28a745" : "#dc3545";
    const lightColor = isDeposit ? "#e6f4ea" : "#fdeaea"; // lighter green/red background
    const barColor = isDeposit ? "#28a745" : "#dc3545";
    const li = document.createElement("li");
    li.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
    <div style="
    width: 8px;
    height: 48px;
    border-radius: 12px;
          background: ${barColor};
          margin-right: 12px;
          flex-shrink: 0;
        "></div>
        <div style="
          padding: 10px 14px;
          background: ${lightColor};
          border-radius: 16px;
          flex: 1;
        ">
          <strong style="color:${mainColor}; font-weight:bold;">${
      item.type
    }:</strong> 
          <span style="color:${mainColor}; font-weight:bold;">${formatCurrency(
      item.amount
    )}</span><br>
          <em style="color:#888;">${item.detail || "-"}</em><br>
          <small style="color:#aaa;">${
            item.time ? formatDate(item.time) : ""
          }</small>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
};

// ---- IuranPay, DEPOSIT and WITHDRAW ----
// DEPOSIT logic function
// --- SAVE TRANSACTION TO SUPABASE ---
depositButton.addEventListener("click", deposit);
function deposit() {
  const rawValue = amountInput.value;
  const detail = detailInput.value;
  const amount = parseInt(rawValue.replace(/\./g, ""));
  if (!isNaN(amount) && amount > 0) {
    balance = parseInt(balance) + amount;

    const newTransaction = {
      type: "Deposit",
      amount,
      detail,
      time: new Date().toISOString(),
    };

    localTransaction.push(newTransaction); // for in-memory use
    saveTransactionData(); // to save online

    // saveTransactionData();
    showTransactionFeedback("Deposit Correction Success!", "green");
  }
  // Reset inputs
  amountInput.value = "";
  detailInput.value = "";
  amountInput.placeholder = "Enter amount";
  detailInput.placeholder = "Enter transaction detail";
}

// WITHDRAW logic function
withdrawButton.addEventListener("click", withdraw);
function withdraw() {
  const rawValue = amountInput.value;
  const detail = detailInput.value;
  const amount = parseInt(rawValue.replace(/\./g, "")); // remove thousand separator
  if (!isNaN(amount) && amount > 0 && amount <= balance) {
    balance = parseInt(balance) - amount; // subtract amount from balance to withdraw (negative amount)
    const newTransaction = {
      type: "Withdraw",
      amount: -amount, // store as negative for clarity
      detail,
      time: new Date().toISOString(), // store as ISO string for consistency
    };

    localTransaction.push(newTransaction); // for in-memory use
    saveTransactionData(); // to save online
    showTransactionFeedback("Withdraw Correction Success!", "red");
  }
  // Reset inputs
  amountInput.value = "";
  detailInput.value = "";
  amountInput.placeholder = "Enter amount";
  detailInput.placeholder = "Enter transaction detail";
}

// Show PopUp feedback message with color
function showTransactionFeedback(message, color) {
  let feedback = document.getElementById("transactionFeedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.id = "transactionFeedback";
    feedback.style.position = "fixed";
    feedback.style.top = "20px";
    feedback.style.right = "20px";
    feedback.style.zIndex = "9999";
    feedback.style.padding = "10px 20px";
    feedback.style.borderRadius = "6px";
    feedback.style.fontWeight = "bold";
    document.body.appendChild(feedback);
  }
  feedback.textContent = message;
  feedback.style.background = color === "green" ? "#d4edda" : "#f8d7da";
  feedback.style.color = color === "green" ? "#155724" : "#721c24";
  feedback.style.border =
    color === "green" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
  feedback.style.display = "block";
  setTimeout(() => {
    feedback.style.display = "none";
  }, 1500);
}

// ---- PAYMENT OPTIONS FOR ----
// Checklist logic for property type and next step
document.addEventListener("DOMContentLoaded", function () {
  const propertyStep = document.getElementById("propertyStep");
  const blockRumah = document.getElementById("blockRumah");
  const blockRumahTypeA = document.getElementById("blockRumahTypeA");
  const blockRumahTypeB = document.getElementById("blockRumahTypeB");
  const blockRuko = document.getElementById("blockRuko");

  // Hide all sub-options initially
  function hideAllBlocks() {
    if (blockRumah) blockRumah.style.display = "none";
    if (blockRumahTypeA) blockRumahTypeA.style.display = "none";
    if (blockRumahTypeB) blockRumahTypeB.style.display = "none";
    if (blockRuko) blockRuko.style.display = "none";
  }

  hideAllBlocks();

  // Step 1: Rumah or Ruko
  if (propertyStep) {
    propertyStep.addEventListener("change", function (e) {
      hideAllBlocks();
      if (e.target.name === "propertyType") {
        if (e.target.value === "Rumah") {
          blockRumah.style.display = "flex";
        } else if (e.target.value === "Ruko") {
          blockRuko.style.display = "flex";
        }
      }
    });
  }

  // Step 2: A or B for Rumah
  if (blockRumah) {
    blockRumah.addEventListener("change", function (e) {
      if (e.target.name === "blockRumahType") {
        blockRumahTypeA.style.display =
          e.target.value === "A" ? "flex" : "none";
        blockRumahTypeB.style.display =
          e.target.value === "B" ? "flex" : "none";
      }
    });
  }
});

// Pay Iuran logic
// --- New Iuran Payment Logic ---
document
  .getElementById("iuranButton")
  .addEventListener("click", handlePayIuranClick);

function parseUnitCode(detailString) {
  // "R1 - Seblak Nasir" => "R1"
  return detailString.split(" - ")[0].trim();
  console.log("Unit code parsed:", unitCode);
}

async function payIuranAndMarkMonths({
  unitCode,
  monthsToMark,
  amount,
  detail,
  time,
  year,
}) {
  // 1) Insert a transaction record
  const tx = {
    type: "Deposit",
    amount,
    detail, // e.g., "R1 - Seblak Nasir"
    months_paid: monthsToMark,
    time: time || new Date().toISOString(),
  };
  const { data: txData, error: txErr } = await supabase
    .from("transactions")
    .insert([tx])
    .select();

  if (txErr) {
    console.error("Insert transaction failed:", txErr);
    return;
  }

  // Optional: Verify the unit exists before calling the RPC
  const { data: unitData, error: unitError } = await supabase
    .from("units")
    .select("id")
    .eq("code", unitCode)
    .single();

  if (unitError || !unitData) {
    console.error("Unit not found:", unitCode);
    // Handle the case where the unit doesn't exist, e.g., show an error
    return;
  }

  // 2) Ask the DB to mark earliest false months as paid (true)
  const { data: rpcData, error: rpcErr } = await supabase.rpc(
    "mark_iuran_paid",
    {
      p_unit_code: unitCode, // e.g., "R1" or "A3"
      p_year: year, // currentPaymentYear (number)
      p_months_to_mark: monthsToMark,
    }
  );

  if (rpcErr) {
    console.error("mark_iuran_paid failed:", rpcErr);
  } else {
    console.log("Months marked:", rpcData);
  }
}

async function handlePayIuranClick() {
  // Determine the selections
  const propertyType = document.querySelector(
    'input[name="propertyType"]:checked'
  )?.value;
  const iuranJumlahBulanInput = document.getElementById("iuranJumlahBulan");
  const monthsToMark = parseInt(iuranJumlahBulanInput.value || "0", 10);
  if (!propertyType || !monthsToMark || monthsToMark <= 0) {
    alert("Lengkapi pilihan dan jumlah bulan.");
    return;
  }

  let detail = ""; // e.g., "R1 - Seblak Nasir" or "A3 - Oma Ratna"
  if (propertyType === "Ruko") {
    const rukoNo = document.querySelector('input[name="blockRukoNo"]:checked');
    if (!rukoNo) return alert("Pilih nomor Ruko.");
    detail = rukoNo.value;
  } else if (propertyType === "Rumah") {
    const rumahType = document.querySelector(
      'input[name="blockRumahType"]:checked'
    );
    if (!rumahType) return alert("Pilih blok A/B.");
    const rumahNo = document.querySelector(
      rumahType.value === "A"
        ? '#blockRumahTypeA input[name="blockRumahNo"]:checked'
        : '#blockRumahTypeB input[name="blockRumahNo"]:checked'
    );
    if (!rumahNo) return alert("Pilih nomor Rumah.");
    detail = rumahNo.value;
  } else {
    // THR branch if add it later
  }

  const unitCode = parseUnitCode(detail);
  const amount = (propertyType === "Ruko" ? 250000 : 170000) * monthsToMark;
  const year = parseInt(currentPaymentYear, 10);

  // Save to DB and mark months
  await payIuranAndMarkMonths({
    unitCode,
    monthsToMark,
    amount,
    detail,
    year,
  });

  // Re-fetch table
  await fetchAndRenderPaymentTracker(currentPaymentTab, year);

  // Optionally, reset selections
  document
    .querySelectorAll('input[type="radio"]')
    .forEach((el) => (el.checked = false));
  // Hide all sub-options
  document.getElementById("blockRumah").style.display = "none";
  document.getElementById("blockRumahTypeA").style.display = "none";
  document.getElementById("blockRumahTypeB").style.display = "none";
  document.getElementById("blockRuko").style.display = "none";

  // Reset iuran input
  iuranJumlahBulanInput.value = "";
  iuranJumlahBulanInput.placeholder = "Mau berapa bulan, Pak?";
}

updateUI();

// ---- PAYMENT TRACKER ----
// Menggunakan hard coded list dulu, nanti diganti dari DB dan render otomatis

// List of Ruko, Rumah A, Rumah B, and THR
const rukoList = [
  "R1 - Seblak Nasir",
  "R2 - Seblak Nasir",
  "R3 - Daily Laudry",
  "R4 - Furniture",
  "R5 - Alex RJM",
  "R6 - Rental PS",
  "R7 - Bengkel Motor Global",
  "R8 - Counter HP",
  "R9 - Counter HP",
  "R10 - PEC",
  "R11 - Pak Gembus",
];
const rumahAList = [
  "A1 - Reza",
  "A2 - Oma Yeti",
  "A3 - Oma Ratna",
  "A4 - Mustafa",
  "A5 - Samuel",
  "A6 - Santoso",
  "A7 - Prabowo",
  "A8 - Dira",
  "A9 - Baru",
  "A10 - Hendro",
  "A11 - Budi",
  "A12 - Satya",
];
const rumahBList = [
  "B1 - Satya",
  "B2 - Haris",
  "B3 - Wuri",
  "B4 - Wahyu",
  "B5 - Encin",
  "B6 - Khunaifi",
  "B7 - Rafi",
  "B8 - Amir",
  "B9 - Bahri",
  "B10 - Hilda",
];
const thrList = [
  "A1 - Reza",
  "A2 - Oma Yeti",
  "A3 - Oma Ratna",
  "A4 - Mustafa",
  "A5 - Samuel",
  "A6 - Santoso",
  "A7 - Prabowo",
  "A8 - Dira",
  "A9 - Baru",
  "A10 - Hendro",
  "A11 - Budi",
  "A12, B1 - Satya",
  "B1 - Satya",
  "B2 - Haris",
  "B3 - Wuri",
  "B4 - Wahyu",
  "B5 - Encin",
  "B6 - Khunaifi",
  "B7 - Rafi",
  "B8 - Amir",
  "B9 - Bahri",
  "B10 - Hilda",
  "R1, R2- Seblak Nasir",
  "R3 - Daily Laudry",
  "R4 - Furniture",
  "R5 - Alex RJM",
  "R6 - Rental PS",
  "R7 - Bengkel Motor Global",
  "R8, R9 - Counter HP",
  "R10 - PEC",
  "R11 - Pak Gembus",
];

// --- Payment Tracker Data Structure ---
let iuranStatusByYear = {};
let currentPaymentTab = "Ruko";
let currentPaymentYear = new Date().getFullYear().toString();

function getOrInitStatusByYear(name, year, months = 12) {
  if (!iuranStatusByYear[year]) iuranStatusByYear[year] = {};
  if (!iuranStatusByYear[year][name])
    iuranStatusByYear[year][name] = Array(months).fill(false);
  return iuranStatusByYear[year][name];
}

loadIuranData();

// --- New Payment Tracker Render ---
async function fetchAndRenderPaymentTracker(category, year) {
  // Get units for this category
  const { data: units, error: uErr } = await supabase
    .from("units")
    .select("id, code, display_name")
    .eq("category", category)
    .order("no_sequence_unit", { ascending: true });

  if (uErr) {
    console.error(uErr);
    return;
  }

  // Batch query tracker rows for these units & year
  const unitIds = units.map((u) => u.id);
  if (unitIds.length === 0) {
    document.getElementById("iuranTableContent").innerHTML = "<p>No units.</p>";
    return;
  }

  const { data: rows, error: rErr } = await supabase
    .from("payment_tracker")
    .select("unit_id, year, month_index, is_checked")
    .in("unit_id", unitIds)
    .eq("year", year);

  if (rErr) {
    console.error(rErr);
    return;
  }

  // Build a quick lookup: unit_id -> [12 booleans]
  const byUnit = new Map();
  units.forEach((u) => byUnit.set(u.id, Array(12).fill(false)));
  rows.forEach((r) => {
    if (r.month_index >= 0 && r.month_index <= 11) {
      byUnit.get(r.unit_id)[r.month_index] = !!r.is_checked;
    }
  });

  // Render
  let months = 12;
  let html = `<table class="iuranTable"><thead><tr><th>Nama</th>`;
  for (let i = 1; i <= months; i++) html += `<th>${i}</th>`;
  html += `</tr></thead><tbody>`;

  units.forEach((u) => {
    const status = byUnit.get(u.id) || Array(12).fill(false);
    const name = `${u.code} - ${u.display_name}`;
    html += `<tr><td>${name}</td>`;
    for (let i = 0; i < months; i++) {
      const paidClass = status[i] ? "paid-cell" : "";
      html += `<td class="${paidClass}"><input type="checkbox" disabled ${
        status[i] ? "checked" : ""
      }></td>`;
    }
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("iuranTableContent").innerHTML = html;
}

// --- Tab and Year Switching ---
document.addEventListener("DOMContentLoaded", function () {
  const tabRuko = document.getElementById("tabRuko");
  const tabRumah = document.getElementById("tabRumah");
  const tabTHR = document.getElementById("tabTHR");
  const yearSelect = document.getElementById("paymentYear");

  function setActive(tab) {
    tabRuko.classList.remove("active");
    tabRumah.classList.remove("active");
    tabTHR.classList.remove("active");
    tab.classList.add("active");
  }

  tabRuko.addEventListener("click", function () {
    setActive(tabRuko);
    currentPaymentTab = "Ruko";
    fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
  });
  tabRumah.addEventListener("click", function () {
    setActive(tabRumah);
    currentPaymentTab = "Rumah";
    fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
  });
  tabTHR.addEventListener("click", function () {
    setActive(tabTHR);
    currentPaymentTab = "THR";
    fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
  });
  yearSelect.addEventListener("change", function () {
    currentPaymentYear = yearSelect.value;
    fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
  });
  // Initial render
  currentPaymentYear = yearSelect.value;
  setActive(tabRuko);
  fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
});

// --- Update iuranStatusByYear when paying iuran ---
function markIuranPaidByYear(name, months, year, type) {
  const arr = getOrInitStatusByYear(name, year, type === "THR" ? 1 : 12);
  let paid = 0;
  for (let i = 0; i < arr.length && paid < months; i++) {
    if (!arr[i]) {
      arr[i] = true;
      paid++;
    }
  }
  // Correctly save the year-based status to localStorage
  localStorage.setItem("iuranStatusByYear", JSON.stringify(iuranStatusByYear));
}

fetchTransactionsFromSupabase();

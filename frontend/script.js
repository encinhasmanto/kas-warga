// ---- BALANCE and TRANSACTIONS ----
// ---- SETUP LOCAL STORAGE - BALANCE & TRANSACTIONS ----
// DECLARE localStorage variables for balance and transactions
let balance = localStorage.getItem("balance") || 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const stored = localStorage.getItem("iuranStatusByYear");

function saveTransactionData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

function loadTransactionData() {
  balance = localStorage.getItem("balance") || 0;
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
}

function loadIuranData() {
  const stored = localStorage.getItem("iuranStatusByYear");
  iuranStatusByYear = stored ? JSON.parse(stored) : {};
}

function saveIuranData() {
  localStorage.setItem("iuranStatusByYear", JSON.stringify(iuranStatusByYear));
}

// Migrate old string transactions to object format (optional, safe to remove after first run) => setting awal untuk masukan transaksi agar jadi object
if (transactions.length && typeof transactions[0] === "string") {
  transactions = transactions.map((str) => ({
    type: str.startsWith("Deposit") ? "Deposit" : "Withdraw",
    amount: parseInt(str.replace(/\D/g, "")),
    detail: "",
  }));
}

// Add thousand separator to amount input
// removes any non-digit characters, then inserts a dot (.) every 3 digits (e.g., 1000 becomes 1.000)
const amountInput = document.getElementById("amount");
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
updateUI = function () {
  document.getElementById("balance").textContent = formatCurrency(balance);
  const list = document.getElementById("transactions");
  list.innerHTML = "";

  // Get the last 10 transactions (most recent first) and loop through them. Without older and later button
  const latest = transactions.slice(-10).reverse();
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

// ---- DEPOSIT and WITHDRAW ----
// DEPOSIT logic function
function deposit() {
  const amountInput = document.getElementById("amount");
  const detailInput = document.getElementById("detail");
  const rawValue = amountInput.value;
  const detail = detailInput.value;
  const amount = parseInt(rawValue.replace(/\./g, ""));
  if (!isNaN(amount) && amount > 0) {
    balance = parseInt(balance) + amount;
    transactions.push({
      type: "Deposit",
      amount,
      detail,
      time: new Date().toISOString(),
    });
    saveTransactionData();
    showTransactionFeedback("Deposit Correction Success!", "green");
  }
  // Reset inputs
  amountInput.value = "";
  detailInput.value = "";
  amountInput.placeholder = "Enter amount";
  detailInput.placeholder = "Enter transaction detail";
}

// WITHDRAW logic function
function withdraw() {
  const amountInput = document.getElementById("amount");
  const detailInput = document.getElementById("detail");
  const rawValue = amountInput.value;
  const detail = detailInput.value;
  const amount = parseInt(rawValue.replace(/\./g, ""));
  if (!isNaN(amount) && amount > 0 && amount <= balance) {
    balance = parseInt(balance) - amount;
    transactions.push({
      type: "Withdraw",
      amount,
      detail,
      time: new Date().toISOString(),
    });
    saveTransactionData();
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
function payIuran() {
  // Determine which property type is selected
  const propertyType = document.querySelector(
    'input[name="propertyType"]:checked'
  );
  let detail = "";
  let amount = 0;
  const iuranJumlahBulanInput = document.getElementById("iuranJumlahBulan");
  let iuranBulan = parseInt(iuranJumlahBulanInput.value);

  if (!propertyType) {
    alert("Pilih Ruko atau Rumah terlebih dahulu.");
    return;
  }

  if (propertyType.value === "Ruko") {
    // Get selected Ruko number
    const rukoNo = document.querySelector('input[name="blockRukoNo"]:checked');
    if (!rukoNo) {
      alert("Pilih nomor Ruko.");
      return;
    }
    detail = rukoNo.value;
    amount = 250000 * iuranBulan; // Assuming 250000 is the monthly fee for Ruko
    markIuranPaidByYear(
      detail,
      iuranBulan,
      currentPaymentYear,
      currentPaymentTab
    );
  } else if (propertyType.value === "Rumah") {
    // Get A or B
    const rumahType = document.querySelector(
      'input[name="blockRumahType"]:checked'
    );
    if (!rumahType) {
      alert("Pilih blok Rumah A/B.");
      return;
    }
    // Get selected Rumah number
    let rumahNo = null;
    if (rumahType.value === "A") {
      rumahNo = document.querySelector(
        '#blockRumahTypeA input[name="blockRumahNo"]:checked'
      );
    } else if (rumahType.value === "B") {
      rumahNo = document.querySelector(
        '#blockRumahTypeB input[name="blockRumahNo"]:checked'
      );
    }
    if (!rumahNo) {
      alert("Pilih nomor Rumah.");
      return;
    }
    detail = rumahNo.value;
    amount = 170000 * iuranBulan; // Assuming 170000 is the monthly fee for Rumah
    markIuranPaidByYear(
      detail,
      iuranBulan,
      currentPaymentYear,
      currentPaymentTab
    );
  }

  // Add to balance and transactions
  balance = parseInt(balance) + amount;
  transactions.push({
    type: "Deposit",
    amount,
    detail,
    time: new Date().toISOString(),
  });
  saveTransactionData();

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

  renderIuranTable(currentPaymentTab, currentPaymentYear);
}

updateUI();

// ---- TABLE and YEAR SWITCHING TRACKER ----
// ---- SETUP LOCAL STORAGE - IURAN STATUS ----
// DECLARE localStorage variables for iuran status
// let iuranStatus = {};
// const storedStatus = localStorage.getItem("iuranStatus");
// if (storedStatus) {
//   iuranStatus = JSON.parse(storedStatus);
// }

// function saveIuranStatus() {
//   localStorage.setItem("iuranStatus", JSON.stringify(iuranStatus));
// }

// let balance = localStorage.getItem("balance") || 0;
// let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// function saveData() {
//   localStorage.setItem("balance", balance);
//   localStorage.setItem("transactions", JSON.stringify(transactions));
//   updateUI();
// }

// let iuranStatusByYear = {};
// const storedStatusByYear = localStorage.getItem("iuranStatusByYear");
// if (storedStatusByYear) {
//   iuranStatusByYear = JSON.parse(storedStatusByYear);
// }

// // ---- LOCAL STORAGE SETUP ----
// let balance = localStorage.getItem("balance") || 0;
// let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// let iuranStatusByYear = {};
// const storedStatusByYear = localStorage.getItem("iuranStatusByYear");
// if (storedStatusByYear) {
//   iuranStatusByYear = JSON.parse(storedStatusByYear);
// }

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
  "R11 - Kelontong Baru",
];
const rumahAList = [
  "A1 - Reza",
  "A2 - Oma Yeti",
  "A3 - Oma Ratna",
  "A4 - Mus",
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
  "A4 - Mus",
  "A5 - Samuel",
  "A6 - Santoso",
  "A7 - Prabowo",
  "A8 - Dira",
  "A9 - Baru",
  "A10 - Hendro",
  "A11 - Budi",
  "A12, B1 - Satya",
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
  "R11 - Kelontong Baru",
];

/**
 * Get or initialize iuran status for a given name and month count.
 *
 * @param {string} name Name of the Ruko or Rumah
 * @param {number} [months=12] Number of months to track
 * @returns {Array.<boolean>} Array of boolean values indicating iuran payment status
 */
function getOrInitStatus(name, months = 12) {
  if (!iuranStatus[name]) iuranStatus[name] = Array(months).fill(false);
  return iuranStatus[name];
}

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

function renderIuranTable(type, year) {
  let list = [];
  let months = 12;
  if (type === "Ruko") list = rukoList;
  else if (type === "Rumah") list = [...rumahAList, ...rumahBList];
  else if (type === "THR") {
    list = thrList;
    months = 1;
  }

  let html = `<table class="iuranTable"><thead><tr><th>Nama</th>`;
  for (let i = 1; i <= months; i++)
    html += `<th>${type === "THR" ? "THR" : i}</th>`;
  html += `</tr></thead><tbody>`;

  list.forEach((name) => {
    const status = getOrInitStatusByYear(name, year, months);
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
    renderIuranTable(currentPaymentTab, currentPaymentYear);
  });
  tabRumah.addEventListener("click", function () {
    setActive(tabRumah);
    currentPaymentTab = "Rumah";
    renderIuranTable(currentPaymentTab, currentPaymentYear);
  });
  tabTHR.addEventListener("click", function () {
    setActive(tabTHR);
    currentPaymentTab = "THR";
    renderIuranTable(currentPaymentTab, currentPaymentYear);
  });
  yearSelect.addEventListener("change", function () {
    currentPaymentYear = yearSelect.value;
    renderIuranTable(currentPaymentTab, currentPaymentYear);
  });
  // Initial render
  currentPaymentYear = yearSelect.value;
  setActive(tabRuko);
  renderIuranTable(currentPaymentTab, currentPaymentYear);
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

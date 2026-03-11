// ---- INITIALIZATION SUPABASE ----
// import { createClient } from '@supabase/supabase-js';
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseURL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";
const supabase = createClient(supabaseURL, supabaseKey);

const transactionChannel = supabase.channel("transaction-changes");
const paymentTrackerChannel = supabase.channel("payment-tracker-channel");
// // Subscribe to changes in the 'transactions' and 'payment_tracker' table
// supabase
//   .channel("transaction-changes")

// Setup transaction channel
transactionChannel
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
    },
  )
  // .subscribe();
  .subscribe((status) => {
    console.log("Transaction channel status:", status);
  });
// supabase
// .channel("payment-tracker-channel")
paymentTrackerChannel
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "payment_tracker" },
    (payload) => {
      console.log("Payment tracker changed:", payload);
      fetchAndRenderPaymentTracker(currentPaymentTab, currentPaymentYear);
    },
  )
  // .subscribe();
  .subscribe((status) => {
    console.log("Payment tracker channel status:", status);
  });

// Cleanup function for channels
window.addEventListener("beforeunload", () => {
  transactionChannel.unsubscribe();
  paymentTrackerChannel.unsubscribe();
});

// ---- BALANCE and TRANSACTIONS ----
// ---- SETUP LOCAL STORAGE - BALANCE & TRANSACTIONS ----
// DECLARE localStorage variables for balance and transactions
let balance = localStorage.getItem("balance") || 0;
let localTransaction =
  JSON.parse(localStorage.getItem("localTransaction")) || [];

// For tracking synced transactions by time
const syncedTimes = new Set(
  JSON.parse(localStorage.getItem("syncedTimes")) || [],
);

function saveTransactionData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("localTransaction", JSON.stringify(localTransaction));

  async function addTransactionToSupabase(transaction) {
    // Skip if already synced by timestamp
    if (syncedTimes.has(transaction.transaction_date)) return;

    // Prepare transaction data for Supabase
    const transactionData = {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category_id: transaction.category_id,
      transaction_date: transaction.transaction_date,
    };

    // Add category_id if it exists (for withdrawals)
    if (transaction.category_id) {
      transactionData.category_id = transaction.category_id;
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionData]);

    if (error) {
      console.error("Insert failed:", error);
    } else {
      console.log(
        "✅ Saved to Supabase:",
        transaction.description,
        "Rp" + Math.abs(transaction.amount),
        data,
      );
      transaction.synced = true; // Mark as synced
      syncedTimes.add(transaction.transaction_date); // Add to set
      syncedTimes.add(transaction.transaction_date); // Add to set
      localStorage.setItem("syncedTimes", JSON.stringify([...syncedTimes])); // Save set
      localStorage.setItem(
        "localTransaction",
        JSON.stringify(localTransaction),
      );
    }
  }

  // Deduplicate: only sync transactions whose time is not in syncedTimes and are the first occurrence in localTransaction
  const uniqueToSync = localTransaction.filter(
    (tx, idx, arr) =>
      !syncedTimes.has(tx.transaction_date) &&
      arr.findIndex((t) => t.transaction_date === tx.transaction_date) === idx,
    !syncedTimes.has(tx.transaction_date) &&
      arr.findIndex((t) => t.transaction_date === tx.transaction_date) === idx,
  );
  uniqueToSync.forEach((transaction) => {
    addTransactionToSupabase(transaction);
    console.log("Syncing transaction:", transaction);
  });

  updateUI();
}

// FETCH EXPENSE CATEGORIES FROM SUPABASE
async function fetchExpenseCategoriesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching expense categories:", error);
      return;
    }

    // Populate the category dropdown
    const categorySelect = document.getElementById("expenseCategory");
    categorySelect.innerHTML =
      '<option value="">-- Select Category --</option>';

    if (data && data.length > 0) {
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
      console.log("✅ Loaded " + data.length + " expense categories");
    } else {
      console.warn("⚠️ No expense categories found");
    }
  } catch (err) {
    console.error("❌ Error loading expense categories:", err);
  }
}

// Fetch categories when page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchExpenseCategoriesFromSupabase();
  initializePaginationListeners();
});

// ---- FETCH TRANSACTIONS FROM SUPABASE ----
async function fetchTransactionsFromSupabase() {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:expense_categories(id, name)
    `,
    )
    .order("transaction_date", { ascending: true }); // Get most recent first

  if (error) {
    console.error("Error fetching data:", error);
    return data;
  }

  // Update local transactions array
  localTransaction = data.map((tx) => ({
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    category_id: tx.category_id,
    category_name: tx.category?.name,
    transaction_date: tx.transaction_date,
  }));

  // Update syncedTimes to match all transaction times from Supabase
  const allTimes = localTransaction.map((tx) => tx.transaction_date);
  const uniqueTimes = Array.from(new Set(allTimes));
  syncedTimes.clear();
  uniqueTimes.forEach((t) => syncedTimes.add(t));
  localStorage.setItem("syncedTimes", JSON.stringify([...syncedTimes]));

  // Update balance
  balance = 0;
  localTransaction.forEach((tx) => {
    if (tx.type === "deposit" || tx.type === "Deposit") {
      balance += tx.amount;
    } else if (tx.type === "withdrawal" || tx.type === "Withdraw") {
      balance += tx.amount; // amount is already negative
    }
  });

  // Save to localStorage
  localStorage.setItem("localTransaction", JSON.stringify(localTransaction));
  localStorage.setItem("balance", balance);

  // Reset pagination to page 1 when fetching new data
  currentTransactionPage = 1;

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
    description: "",
  }));
}

// Add thousand separator to amount input
// removes any non-digit characters, then inserts a dot (.) every 3 digits (e.g., 1000 becomes 1.000)
const depositAmountInput = document.getElementById("depositAmount");
const depositDescriptionInput = document.getElementById("depositDescription");
const withdrawAmountInput = document.getElementById("withdrawAmount");
const withdrawDescriptionInput = document.getElementById("withdrawDescription");
const expenseCategorySelect = document.getElementById("expenseCategory");

// Add thousand separator listeners for both inputs
[depositAmountInput, withdrawAmountInput].forEach((input) => {
  if (input) {
    input.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    });
  }
});

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

// ---- PAGINATION ----
let currentTransactionPage = 1;
const TRANSACTIONS_PER_PAGE = 10;
const MAX_PAGES = 3;

// ---- UPDATE UI ----
// update the UI in real-time as new transactions are added or the balance changes.
const updateUI = function () {
  document.getElementById("balance").textContent = formatCurrency(balance);
  const list = document.getElementById("transactionsHistory");
  list.innerHTML = "";

  // Get all transactions, sorted most recent first
  const allTransactions = [...localTransaction].reverse();

  // LIMIT: Only keep the latest 30 transactions (3 pages × 10 per page)
  const maxTransactions = TRANSACTIONS_PER_PAGE * MAX_PAGES; // 10 × 3 = 30
  const limitedTransactions = allTransactions.slice(0, maxTransactions);

  // Calculate pagination
  const totalTransactions = limitedTransactions.length;
  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  // Ensure current page is valid
  if (currentTransactionPage > totalPages) {
    currentTransactionPage = Math.max(1, totalPages);
  }

  // Get transactions for current page
  const startIndex = (currentTransactionPage - 1) * TRANSACTIONS_PER_PAGE;
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
  const pageTransactions = limitedTransactions.slice(startIndex, endIndex);

  // Render transactions
  pageTransactions.forEach((item) => {
    const isDeposit = item.type === "deposit" || item.type === "Deposit";
    const mainColor = isDeposit ? "#28a745" : "#dc3545";
    const lightColor = isDeposit ? "#e6f4ea" : "#fdeaea";
    const barColor = isDeposit ? "#28a745" : "#dc3545";
    const li = document.createElement("li");

    // Prepare transaction label
    let transactionLabel = isDeposit ? "Deposit" : "Withdraw";
    let description = item.description || item.description || "-";

    // For withdrawals, add category name if available
    let categoryLabel = "";
    if (!isDeposit && item.category_name) {
      categoryLabel = `<strong>${item.category_name}</strong> - `;
    }

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
      <div class="transaction-item" style="
        padding: 10px 14px;
        background: ${lightColor};
        border-radius: 16px;
        flex: 1;
      ">
        <strong style="color:${mainColor}; font-weight:bold;">${transactionLabel}:</strong>
        <span style="color:${mainColor}; font-weight:bold;">${formatCurrency(
          Math.abs(item.amount),
        )}</span><br>
        <em style="color:#888;">${categoryLabel}${description}</em><br>
        <small style="color:#aaa;">${
          item.transaction_date
            ? formatDate(item.transaction_date)
            : item.time
              ? formatDate(item.time)
              : ""
        }</small>
      </div>
    </div>
    `;
    list.appendChild(li);
  });

  // Update pagination controls using existing HTML elements
  const paginationContainer = document.getElementById(
    "transactionPaginationContainer",
  );
  const prevBtn = document.getElementById("paginationPrev");
  const nextBtn = document.getElementById("paginationNext");
  const pageInfoSpan = document.getElementById("pageInfo");

  if (paginationContainer && prevBtn && nextBtn && pageInfoSpan) {
    // Update page info
    pageInfoSpan.textContent = `Page ${currentTransactionPage} of ${totalPages}`;

    // Update Previous (Newer) button visibility and state
    const prevDisabled = currentTransactionPage === 1;
    prevBtn.disabled = prevDisabled;
    prevBtn.style.display = prevDisabled ? "none" : "block";

    // Update Next (Older) button visibility and state
    const nextDisabled = currentTransactionPage === totalPages;
    nextBtn.disabled = nextDisabled;
    nextBtn.style.display = nextDisabled ? "none" : "block";

    // Show/hide pagination container if only 1 page
    paginationContainer.style.display = totalPages > 1 ? "flex" : "none";
  }
};

// ---- IuranPay, DEPOSIT and WITHDRAW ----
// --- SAVE TRANSACTION TO SUPABASE ---
// WITHDRAW logic function
document.getElementById("withdrawButton").addEventListener("click", withdraw);
function withdraw() {
  const rawValue = withdrawAmountInput.value;
  const description = withdrawDescriptionInput.value;
  const categoryId = expenseCategorySelect.value;
  const amount = parseInt(rawValue.replace(/\./g, "")); // remove thousand separator

  // Validate inputs
  if (!categoryId) {
    showTransactionFeedback("Please select a category!", "red");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showTransactionFeedback("Please enter a valid amount!", "red");
    return;
  }

  if (!description.trim()) {
    showTransactionFeedback("Please enter a description!", "red");
    return;
  }

  if (!isNaN(amount) && amount > 0) {
    balance = parseInt(balance) - amount; // subtract amount from balance to withdraw (negative amount)
    const newTransaction = {
      type: "withdrawal",
      amount: -amount, // store as negative for clarity
      description: description,
      category_id: categoryId,
      transaction_date: new Date().toISOString(), // store as ISO string for consistency
    };

    localTransaction.push(newTransaction); // for in-memory use
    currentTransactionPage = 1; // Reset to page 1 when new transaction added
    saveTransactionData(); // to save online
    showTransactionFeedback("✅ Withdraw recorded successfully!", "green");
  }
  // Reset inputs
  withdrawAmountInput.value = "";
  withdrawDescriptionInput.value = "";
  expenseCategorySelect.value = "";
  withdrawAmountInput.placeholder = "Enter amount";
  withdrawDescriptionInput.placeholder = "Enter description";
}

// DEPOSIT logic function
document.getElementById("depositButton").addEventListener("click", deposit);
function deposit() {
  const rawValue = depositAmountInput.value;
  const description = depositDescriptionInput.value;
  const amount = parseInt(rawValue.replace(/\./g, ""));

  // Validate inputs
  if (isNaN(amount) || amount <= 0) {
    showTransactionFeedback("Please enter a valid amount!", "red");
    return;
  }

  if (!description.trim()) {
    showTransactionFeedback("Please enter a description!", "red");
    return;
  }

  if (!isNaN(amount) && amount > 0) {
    balance = parseInt(balance) + amount;

    const newTransaction = {
      type: "deposit",
      amount,
      description: description,
      transaction_date: new Date().toISOString(),
    };

    localTransaction.push(newTransaction); // for in-memory use
    currentTransactionPage = 1; // Reset to page 1 when new transaction added
    saveTransactionData(); // to save online

    // saveTransactionData();
    showTransactionFeedback("✅ Deposit recorded successfully!", "green");
  }
  // Reset inputs
  depositAmountInput.value = "";
  depositDescriptionInput.value = "";
  depositAmountInput.placeholder = "Enter amount";
  depositDescriptionInput.placeholder = "Enter description";
}

// ---- PAGINATION BUTTONS ----
// Initialize pagination button event listeners
function initializePaginationListeners() {
  const prevBtn = document.getElementById("paginationPrev");
  const nextBtn = document.getElementById("paginationNext");
  // const transactionsContainer = document.querySelector(".transactionsContainer");
  const transactionsHistoryContainer = document.getElementById(
    "transactionsHistory",
  );

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentTransactionPage > 1) {
        // Animate the transactions container with flip-left
        // if (transactionsContainer) {
        //   transactionsContainer.classList.add("animate-flip-left");
        // }
        if (transactionsHistoryContainer) {
          transactionsHistoryContainer.classList.add("animate-flip-left");
        }
        // Remove animation class after animation completes
        //   setTimeout(() => {
        //     transactionsContainer.classList.remove("animate-flip-left");
        //   }, 600);
        // }
        setTimeout(() => {
          transactionsHistoryContainer.classList.remove("animate-flip-left");
        }, 600);
      }
      currentTransactionPage--;
      updateUI();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (
        currentTransactionPage <
        Math.ceil(localTransaction.length / TRANSACTIONS_PER_PAGE)
      ) {
        // Animate the transactions container with flip-right
        // if (transactionsContainer) {
        //   transactionsContainer.classList.add("animate-flip-right");
        if (transactionsHistoryContainer) {
          transactionsHistoryContainer.classList.add("animate-flip-right");
          // Remove animation class after animation completes
          // setTimeout(() => {
          //   transactionsContainer.classList.remove("animate-flip-right");
          // }, 600);
          setTimeout(() => {
            transactionsHistoryContainer.classList.remove("animate-flip-right");
          }, 600);
        }

        currentTransactionPage++;
        updateUI();
      }
    });
  }
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

// ---- DYNAMIC UNITS LOADING ----
// Step 1: Store units data globally so we can reference it
let allUnits = [];
let unitsByCategory = {};

// Step 2: Fetch all units from Supabase
async function fetchUnitsFromSupabase() {
  console.log("🔍 fetchUnitsFromSupabase() called");

  // First, let's try to fetch WITHOUT specifying columns to see what columns exist
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("no_sequence_unit", { ascending: true });

  console.log("📊 Raw fetch result:");
  console.log("Error:", error);
  console.log("Data:", data);
  console.log("Data length:", data ? data.length : "null");

  if (error) {
    console.error("❌ Error fetching units:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ No units found in database");
    return;
  }

  console.log("✅ Raw data from Supabase (COMPLETE OBJECTS):");
  data.forEach((unit, index) => {
    console.log(`[${index}]`, unit);
    console.log(`  - code: "${unit.code}"`);
    console.log(
      `  - category: "${unit.category}" (type: ${typeof unit.category})`,
    );
    console.log(
      `  - unit_type: "${unit.unit_type}" (type: ${typeof unit.unit_type})`,
    );
    console.log(`  - name: "${unit.name}"`);
    console.log(`  - name: "${unit.name}"`);
  });

  allUnits = data;

  // Organize units by category for easy lookup
  unitsByCategory = {};
  allUnits.forEach((unit) => {
    console.log(
      `Processing unit:`,
      unit.code,
      `category: "${unit.category}", type: "${unit.unit_type}"`,
    );
    if (!unitsByCategory[unit.category]) {
      unitsByCategory[unit.category] = [];
    }
    unitsByCategory[unit.category].push(unit);
  });

  console.log("📋 Units organized by category:");
  console.log("unitsByCategory:", unitsByCategory);
  console.log(
    "Ruko count:",
    unitsByCategory["Ruko"] ? unitsByCategory["Ruko"].length : 0,
  );
  console.log(
    "Rumah count:",
    unitsByCategory["Rumah"] ? unitsByCategory["Rumah"].length : 0,
  );

  // NEW: Let's specifically inspect Rumah units
  if (unitsByCategory["Rumah"]) {
    console.log("🔍 DETAILED RUMAH UNITS:");
    unitsByCategory["Rumah"].forEach((unit, i) => {
      console.log(
        `Rumah[${i}]: code="${unit.code}", unit_type="${unit.unit_type}", type check A=${unit.unit_type === "A"}, type check B=${unit.unit_type === "B"}`,
      );
    });
  }

  populateDropdowns();
}

// Step 3: Create HTML for radio buttons dynamically
function createRadioLabel(unit, radioName) {
  // Format: "R1 - Seblak Nasir" or "A1 - Reza"
  const value = `${unit.code} - ${unit.name}`;
  const label = document.createElement("label");
  label.innerHTML = `
    <input type="radio" name="${radioName}" value="${value}" />
    <strong>${unit.code}</strong> -&nbsp;<strong>${unit.name}</strong>`;
  return label;
}

// Step 4: Populate Ruko dropdown
function populateRukoOptions() {
  console.log("🔧 populateRukoOptions() called");
  const blockRuko = document.getElementById("blockRuko");
  const rukoUnits = unitsByCategory["Ruko"] || [];

  console.log("Ruko container found:", blockRuko);
  console.log("Ruko units to populate:", rukoUnits);

  // Clear existing options
  blockRuko.innerHTML = "";

  if (rukoUnits.length === 0) {
    console.warn("⚠️ No Ruko units found!");
    blockRuko.innerHTML = "<p style='color: red;'>No Ruko units found</p>";
  }

  rukoUnits.forEach((unit, index) => {
    console.log(`Adding Ruko unit: [${index}] ${unit.code} - ${unit.name}`);
    blockRuko.appendChild(createRadioLabel(unit, "blockRukoNo"));
  });

  console.log("✅ Ruko dropdown populated with", rukoUnits.length, "units");
}

// Step 5: Populate Rumah A dropdown
function populateRumahAOptions() {
  console.log("🔧 populateRumahAOptions() called");
  const blockRumahTypeA = document.getElementById("blockRumahTypeA");
  const rumahUnits = unitsByCategory["Rumah"] || [];

  console.log("Rumah Type A container found:", blockRumahTypeA);
  console.log("All Rumah units available:", rumahUnits);

  // Filter only type A units - Extract type from code (first character)
  const typeAUnits = rumahUnits.filter((u) => {
    // Get first character of code and check if it's "A"
    const codeFirstChar = (u.code || "").charAt(0).toUpperCase();
    const isTypeA = codeFirstChar === "A";
    console.log(
      `Checking ${u.code}: first char="${codeFirstChar}", isTypeA=${isTypeA}`,
    );
    return isTypeA;
  });

  console.log("Filtered Type A units:", typeAUnits);

  // Clear existing options
  blockRumahTypeA.innerHTML = "";

  if (typeAUnits.length === 0) {
    console.warn("⚠️ No Rumah Type A units found!");
    blockRumahTypeA.innerHTML =
      "<p style='color: red;'>No Rumah Type A units found</p>";
  }

  typeAUnits.forEach((unit, index) => {
    console.log(`Adding Rumah A unit: [${index}] ${unit.code} - ${unit.name}`);
    blockRumahTypeA.appendChild(createRadioLabel(unit, "blockRumahNo"));
  });

  console.log(
    "✅ Rumah Type A dropdown populated with",
    typeAUnits.length,
    "units",
  );
}

// Step 6: Populate Rumah B dropdown
function populateRumahBOptions() {
  console.log("🔧 populateRumahBOptions() called");
  const blockRumahTypeB = document.getElementById("blockRumahTypeB");
  const rumahUnits = unitsByCategory["Rumah"] || [];

  console.log("Rumah Type B container found:", blockRumahTypeB);
  console.log("All Rumah units available:", rumahUnits);

  // Filter only type B units - Extract type from code (first character)
  const typeBUnits = rumahUnits.filter((u) => {
    // Get first character of code and check if it's "B"
    const codeFirstChar = (u.code || "").charAt(0).toUpperCase();
    const isTypeB = codeFirstChar === "B";
    console.log(
      `Checking ${u.code}: first char="${codeFirstChar}", isTypeB=${isTypeB}`,
    );
    return isTypeB;
  });

  console.log("Filtered Type B units:", typeBUnits);

  // Clear existing options
  blockRumahTypeB.innerHTML = "";

  if (typeBUnits.length === 0) {
    console.warn("⚠️ No Rumah Type B units found!");
    blockRumahTypeB.innerHTML =
      "<p style='color: red;'>No Rumah Type B units found</p>";
  }

  typeBUnits.forEach((unit, index) => {
    console.log(`Adding Rumah B unit: [${index}] ${unit.code} - ${unit.name}`);
    blockRumahTypeB.appendChild(createRadioLabel(unit, "blockRumahNo"));
  });

  console.log(
    "✅ Rumah Type B dropdown populated with",
    typeBUnits.length,
    "units",
  );
}

// Step 7: Main function to populate all dropdowns
function populateDropdowns() {
  console.log(
    "🎯 populateDropdowns() called - starting to populate all dropdowns",
  );
  populateRukoOptions();
  populateRumahAOptions();
  populateRumahBOptions();
  console.log("✅ All dropdowns populated");
}

// ---- POPULATE THR OPTIONS ----
function populateTHROptions() {
  console.log("🔧 populateTHROptions() called");
  const blockTHR = document.getElementById("blockTHR");

  // For THR, show all units from both Ruko and Rumah
  const rukoUnits = unitsByCategory["Ruko"] || [];
  const rumahUnits = unitsByCategory["Rumah"] || [];
  const allTHRUnits = [...rukoUnits, ...rumahUnits];

  console.log("THR units available (Ruko + Rumah):", allTHRUnits);

  // Clear existing options
  blockTHR.innerHTML = "";

  if (allTHRUnits.length === 0) {
    console.warn("⚠️ No units found for THR!");
    blockTHR.innerHTML = "<p style='color: red;'>No units found for THR</p>";
    return;
  }

  allTHRUnits.forEach((unit) => {
    blockTHR.appendChild(createRadioLabel(unit, "blockTHRNo"));
  });

  console.log("✅ THR dropdown populated with", allTHRUnits.length, "units");
}

// ---- POPULATE IURAN TEMBOK OPTIONS ----
function populateIuranTembokOptions() {
  const blockIuranTembok = document.getElementById("blockIuranTembok");

  // For Iuran Tembok, we show all Rumah units (both A and B combined)
  const rumahUnits = unitsByCategory["Rumah"] || [];

  console.log("Iuran Tembok units available:", rumahUnits);

  // Clear existing options
  blockIuranTembok.innerHTML = "";

  if (rumahUnits.length === 0) {
    console.warn("⚠️ No Rumah units found for Iuran Tembok!");
    blockIuranTembok.innerHTML =
      "<p style='color: red;'>No Rumah units found</p>";
    return;
  }

  // Sort and display all Rumah units together
  rumahUnits.forEach((unit) => {
    blockIuranTembok.appendChild(createRadioLabel(unit, "blockIuranTembokNo"));
  });

  console.log(
    "✅ Iuran Tembok dropdown populated with",
    rumahUnits.length,
    "units",
  );
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

  // ---- PAYMENT TYPE SELECTION ----
  const paymentTypeBtns = document.querySelectorAll(".paymentTypeBtn");
  const sectionIPL = document.getElementById("sectionIPL");
  const sectionTHR = document.getElementById("sectionTHR");
  const sectionIuranTembok = document.getElementById("sectionIuranTembok");

  function hideAllSections() {
    if (sectionIPL) sectionIPL.style.display = "none";
    if (sectionTHR) sectionTHR.style.display = "none";
    if (sectionIuranTembok) sectionIuranTembok.style.display = "none";
  }

  function removeActiveFromAllButtons() {
    paymentTypeBtns.forEach((btn) => btn.classList.remove("active"));
  }

  paymentTypeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      removeActiveFromAllButtons();
      this.classList.add("active");

      const paymentType = this.getAttribute("data-type");
      hideAllSections();

      if (paymentType === "IPL") {
        if (sectionIPL) sectionIPL.style.display = "block";
      } else if (paymentType === "THR") {
        if (sectionTHR) sectionTHR.style.display = "block";
        populateTHROptions();
      } else if (paymentType === "IuranLain") {
        if (sectionIuranTembok) sectionIuranTembok.style.display = "block";
        populateIuranTembokOptions();
      }
    });
  });

  // Set IPL as default active button on page load
  const btnIPL = document.getElementById("btnIPL");
  if (btnIPL) {
    btnIPL.click();
  }

  // Load units from Supabase on page load
  fetchUnitsFromSupabase();
});

// Pay Iuran logic
// --- New Iuran Payment Logic ---
document
  .getElementById("iuranButton")
  .addEventListener("click", handlePayIuranClick);

function parseUnitCode(descriptionString) {
  // "R1 - Seblak Nasir" => "R1"
  // return descriptionString.split(" - ")[0].trim(); harusnya dihapus return setelah console log
  const unitCode = descriptionString.split(" - ")[0].trim();
  console.log("Unit code parsed:", unitCode);
  return unitCode;
}

async function payIuranAndMarkMonths({
  unitCode,
  monthsToMark,
  amount,
  description,
  time,
  year,
}) {
  // 1) Insert a transaction record
  const tx = {
    type: "deposit",
    amount,
    description, // e.g., "R1 - Seblak Nasir"
    months_paid: monthsToMark,
    transaction_date: time || new Date().toISOString(),
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
    },
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
    'input[name="propertyType"]:checked',
  )?.value;
  const iuranJumlahBulanInput = document.getElementById("iuranJumlahBulan");
  const monthsToMark = parseInt(iuranJumlahBulanInput.value || "0", 10);
  if (!propertyType || !monthsToMark || monthsToMark <= 0) {
    alert("Lengkapi pilihan dan jumlah bulan.");
    return;
  }

  let description = ""; // e.g., "R1 - Seblak Nasir" or "A3 - Oma Ratna"
  if (propertyType === "Ruko") {
    const rukoNo = document.querySelector('input[name="blockRukoNo"]:checked');
    if (!rukoNo) return alert("Pilih nomor Ruko.");
    description = rukoNo.value;
  } else if (propertyType === "Rumah") {
    const rumahType = document.querySelector(
      'input[name="blockRumahType"]:checked',
    );
    if (!rumahType) return alert("Pilih blok A/B.");
    const rumahNo = document.querySelector(
      rumahType.value === "A"
        ? '#blockRumahTypeA input[name="blockRumahNo"]:checked'
        : '#blockRumahTypeB input[name="blockRumahNo"]:checked',
    );
    if (!rumahNo) return alert("Pilih nomor Rumah.");
    description = rumahNo.value;
  } else {
    // THR branch if add it later
  }

  const unitCode = parseUnitCode(description);
  const amount = (propertyType === "Ruko" ? 250000 : 170000) * monthsToMark;
  const year = parseInt(currentPaymentYear, 10);

  // Save to DB and mark months
  await payIuranAndMarkMonths({
    unitCode,
    monthsToMark,
    amount,
    description,
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
    .select("id, code, name")
    .select("id, code, name")
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
    const name = `${u.code} - ${u.name}`;
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
  const currentYear = new Date().getFullYear().toString();
  yearSelect.value = currentYear;
  currentPaymentYear = currentYear;
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

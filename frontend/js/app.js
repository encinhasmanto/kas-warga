let balance = localStorage.getItem("balance") || 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Migrate old string transactions to object format (optional, safe to remove after first run) => setting awal untuk masukan transaksi agar jadi object
if (transactions.length && typeof transactions[0] === "string") {
  transactions = transactions.map((str) => ({
    type: str.startsWith("Deposit") ? "Deposit" : "Withdraw",
    amount: parseInt(str.replace(/\D/g, "")),
    detail: "",
  }));
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

function updateUI() {
  document.getElementById("balance").textContent = formatCurrency(balance);
  const list = document.getElementById("transactions");
  list.innerHTML = "";
  // Get the last 10 transactions (most recent first)
  const latest = transactions.slice(-10).reverse();
  latest.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.type}:</strong> ${formatCurrency(
      item.amount
    )}<br>
      <em>${item.detail || "-"}</em><br>
      <small>${item.time ? formatDate(item.time) : ""}</small>`;
    list.appendChild(li);
  });
}

function deposit() {
  const rawValue = document.getElementById("amount").value;
  const detail = document.getElementById("detail").value;
  const amount = parseInt(rawValue.replace(/\./g, ""));
  if (!isNaN(amount) && amount > 0) {
    balance = parseInt(balance) + amount;
    transactions.push({
      type: "Deposit",
      amount,
      detail,
      time: new Date().toISOString(),
    });
    saveData();
  }
}

function withdraw() {
  const rawValue = document.getElementById("amount").value;
  const detail = document.getElementById("detail").value;
  const amount = parseInt(rawValue.replace(/\./g, ""));
  if (!isNaN(amount) && amount > 0 && amount <= balance) {
    balance = parseInt(balance) - amount;
    transactions.push({
      type: "Withdraw",
      amount,
      detail,
      time: new Date().toISOString(),
    });
    saveData();
  }
}

function saveData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

const amountInput = document.getElementById("amount");
if (amountInput) {
  amountInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  });
}

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
  let iuranBulan = document.getElementById("iuranJumlahBulan").value;

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
  }

  // Add to balance and transactions
  balance = parseInt(balance) + amount;
  transactions.push({
    type: "Deposit",
    amount,
    detail,
    time: new Date().toISOString(),
  });
  saveData();

  // Optionally, reset selections
  document
    .querySelectorAll('input[type="radio"]')
    .forEach((el) => (el.checked = false));
  // Hide all sub-options
  document.getElementById("blockRumah").style.display = "none";
  document.getElementById("blockRumahTypeA").style.display = "none";
  document.getElementById("blockRumahTypeB").style.display = "none";
  document.getElementById("blockRuko").style.display = "none";
}

updateUI();

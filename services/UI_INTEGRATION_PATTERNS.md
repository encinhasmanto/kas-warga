# UI Integration Patterns

Ready-to-use code snippets for integrating services into your frontend.

---

## 1. Login Page Integration

### HTML

```html
<div class="login-container">
  <h1>DompetWarga Login</h1>

  <div class="login-tabs">
    <button class="tab-btn active" data-role="resident">📱 Resident</button>
    <button class="tab-btn" data-role="admin">👨‍💼 Admin</button>
  </div>

  <form id="loginForm">
    <div id="residentFields" class="form-fields">
      <input type="text" id="unitCode" placeholder="Unit Code (e.g., R1, A3)" />
      <input type="password" id="residentPin" placeholder="PIN" />
    </div>

    <div id="adminFields" class="form-fields" style="display: none;">
      <input type="text" id="username" placeholder="Username" />
      <input type="password" id="adminPin" placeholder="PIN" />
    </div>

    <button type="submit">Login</button>
  </form>

  <div id="loginMessage" class="message"></div>
</div>
```

### JavaScript

```javascript
import {
  authenticateResident,
  authenticateAdmin,
} from "./services/authService.js";

let selectedRole = "resident";

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    selectedRole = this.dataset.role;

    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");

    document.getElementById("residentFields").style.display =
      selectedRole === "resident" ? "block" : "none";
    document.getElementById("adminFields").style.display =
      selectedRole === "admin" ? "block" : "none";
  });
});

// Form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const messageDiv = document.getElementById("loginMessage");
  messageDiv.textContent = "Logging in...";
  messageDiv.className = "message info";

  let result;

  if (selectedRole === "resident") {
    const code = document.getElementById("unitCode").value;
    const pin = document.getElementById("residentPin").value;
    result = await authenticateResident(code, pin);
  } else {
    const username = document.getElementById("username").value;
    const pin = document.getElementById("adminPin").value;
    result = await authenticateAdmin(username, pin);
  }

  if (result.success) {
    messageDiv.textContent = `Welcome, ${result.data.display_name || result.data.username}!`;
    messageDiv.className = "message success";

    // Redirect after 1 second
    setTimeout(() => {
      window.location.href =
        selectedRole === "resident" ? "/dashboard.html" : "/admin.html";
    }, 1000);
  } else {
    messageDiv.textContent = result.error;
    messageDiv.className = "message error";
  }
});
```

### CSS

```css
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.tab-btn.active {
  border-color: #4caf50;
  background: #4caf50;
  color: white;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.form-fields input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.message {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.message.success {
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}

.message.info {
  background: #d1ecf1;
  color: #0c5460;
}
```

---

## 2. Resident Payment Status Dashboard

### HTML

```html
<div class="resident-dashboard">
  <header>
    <h1>📋 My Payment Status</h1>
    <button id="logoutBtn">Logout</button>
  </header>

  <div class="balance-card">
    <span class="label">Total Amount Due</span>
    <span class="amount" id="totalDue">Rp0</span>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <span class="progress-text" id="progressText">0% paid</span>
  </div>

  <div class="obligations-list">
    <h2>📅 Payment Details</h2>
    <div id="obligationsList"></div>
  </div>
</div>
```

### JavaScript

```javascript
import { getCurrentUser, logout } from "./services/authService.js";
import { getUnitPaymentStatus } from "./services/paymentService.js";

async function loadPaymentStatus() {
  const user = getCurrentUser();

  if (!user || user.type !== "resident") {
    window.location.href = "/login.html";
    return;
  }

  const result = await getUnitPaymentStatus(user.id);

  if (!result.success) {
    alert("Error loading payment status: " + result.error);
    return;
  }

  const status = result.data;

  // Update summary
  document.getElementById("totalDue").textContent = formatRp(status.total_due);
  document.getElementById("progressFill").style.width =
    `${status.payment_percentage}%`;
  document.getElementById("progressText").textContent =
    `${status.payment_percentage}% paid`;

  // Render obligations
  const list = document.getElementById("obligationsList");
  list.innerHTML = "";

  status.obligations.forEach((obl) => {
    const card = document.createElement("div");
    card.className = `obligation-card ${obl.status}`;
    card.innerHTML = `
      <div class="row">
        <h3>${obl.event_name}</h3>
        <span class="status-badge ${obl.status}">${obl.status.toUpperCase()}</span>
      </div>
      <div class="details">
        <div class="detail-row">
          <span>Amount Due:</span>
          <span>${formatRp(obl.amount_due)}</span>
        </div>
        <div class="detail-row">
          <span>Amount Paid:</span>
          <span>${formatRp(obl.amount_paid)}</span>
        </div>
        <div class="detail-row">
          <span>Remaining:</span>
          <span class="remaining">${formatRp(obl.amount_remaining)}</span>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

function formatRp(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
  window.location.href = "/login.html";
});

// Load on page load
document.addEventListener("DOMContentLoaded", loadPaymentStatus);
```

### CSS

```css
.resident-dashboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

header button {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.balance-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.balance-card .label {
  display: block;
  color: #666;
  margin-bottom: 5px;
}

.balance-card .amount {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.obligation-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 4px solid #ddd;
}

.obligation-card.paid {
  border-left-color: #28a745;
  background: #f0f9f6;
}

.obligation-card.pending {
  border-left-color: #ffc107;
  background: #fffbf0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.paid {
  background: #28a745;
  color: white;
}

.status-badge.pending {
  background: #ffc107;
  color: black;
}

.details {
  margin-top: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 14px;
}

.remaining {
  color: #dc3545;
  font-weight: bold;
}
```

---

## 3. Admin Payment Entry Form

### HTML

```html
<div class="admin-panel">
  <h1>💳 Record Payment</h1>

  <form id="paymentForm">
    <div class="form-group">
      <label>Unit</label>
      <select id="unitSelect" required>
        <option value="">Select Unit...</option>
      </select>
    </div>

    <div class="form-group">
      <label>Pending Obligations</label>
      <div id="obligationsList"></div>
    </div>

    <div class="form-group">
      <label>Amount</label>
      <input type="number" id="amount" placeholder="0" required />
    </div>

    <div class="form-group">
      <label>Payment Method</label>
      <select id="paymentMethod" required>
        <option value="cash">💵 Cash</option>
        <option value="transfer">💳 Bank Transfer</option>
        <option value="check">📄 Check</option>
      </select>
    </div>

    <div class="form-group">
      <label>Notes</label>
      <textarea id="notes" placeholder="Optional notes"></textarea>
    </div>

    <button type="submit" class="btn-primary">Record Payment</button>
  </form>

  <div id="message" class="message"></div>
</div>
```

### JavaScript

```javascript
import { recordPayment } from "./services/paymentService.js";
import { getAllPendingObligations } from "./services/obligationService.js";
import { getCurrentUser } from "./services/authService.js";

let pendingObligations = [];

async function loadForm() {
  // Check admin access
  const user = getCurrentUser();
  if (!user || user.type !== "admin") {
    window.location.href = "/login.html";
    return;
  }

  // Load pending obligations
  const result = await getAllPendingObligations();

  if (!result.success) {
    showMessage(result.error, "error");
    return;
  }

  pendingObligations = result.data;

  // Populate unit select
  const unitSelect = document.getElementById("unitSelect");
  const units = [...new Set(result.data.map((o) => o.unit.code))];

  units.forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit;
    unitSelect.appendChild(option);
  });

  // Update obligations when unit changes
  unitSelect.addEventListener("change", updateObligations);
}

function updateObligations() {
  const selectedUnit = document.getElementById("unitSelect").value;
  const obligationsList = document.getElementById("obligationsList");
  obligationsList.innerHTML = "";

  const unitObligations = pendingObligations.filter(
    (o) => o.unit.code === selectedUnit,
  );

  unitObligations.forEach((obl) => {
    const div = document.createElement("div");
    div.className = "obligation-option";
    div.innerHTML = `
      <input type="radio" name="obligation" value="${obl.id}"
             data-amount="${obl.amount}">
      <label>
        ${obl.event.name} - ${formatRp(obl.amount)}
      </label>
    `;

    div.querySelector("input").addEventListener("change", function () {
      document.getElementById("amount").value = obl.amount;
    });

    obligationsList.appendChild(div);
  });
}

document.getElementById("paymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const obligationId = document.querySelector(
    'input[name="obligation"]:checked',
  )?.value;

  if (!obligationId) {
    showMessage("Please select an obligation", "error");
    return;
  }

  const amount = parseInt(document.getElementById("amount").value);

  if (isNaN(amount) || amount <= 0) {
    showMessage("Invalid amount", "error");
    return;
  }

  const result = await recordPayment({
    obligation_id: obligationId,
    amount,
    payment_method: document.getElementById("paymentMethod").value,
    notes: document.getElementById("notes").value,
  });

  if (result.success) {
    showMessage("✅ Payment recorded successfully", "success");
    document.getElementById("paymentForm").reset();
    updateObligations();
  } else {
    showMessage(result.error, "error");
  }
});

function showMessage(text, type) {
  const div = document.getElementById("message");
  div.textContent = text;
  div.className = `message ${type}`;
  div.style.display = "block";

  if (type === "success") {
    setTimeout(() => {
      div.style.display = "none";
    }, 3000);
  }
}

function formatRp(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

document.addEventListener("DOMContentLoaded", loadForm);
```

---

## 4. Admin Dashboard

### HTML

```html
<div class="admin-dashboard">
  <header>
    <h1>📊 Admin Dashboard</h1>
    <button id="logoutBtn">Logout</button>
  </header>

  <div class="dashboard-grid">
    <div class="card">
      <h3>💰 Kas Balance</h3>
      <div class="value" id="kasBalance">Rp0</div>
    </div>

    <div class="card">
      <h3>📥 Total Collected</h3>
      <div class="value" id="totalCollected">Rp0</div>
    </div>

    <div class="card">
      <h3>⏳ Pending Payments</h3>
      <div class="value" id="pendingCount">0</div>
    </div>

    <div class="card">
      <h3>📋 Total Obligations</h3>
      <div class="value" id="totalObligations">0</div>
    </div>
  </div>

  <div class="tables-section">
    <h2>📉 Recent Transactions</h2>
    <table id="recentTransactions">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
</div>
```

### JavaScript

```javascript
import {
  getKasBalance,
  getTransactions,
} from "./services/transactionService.js";
import {
  getPaymentSummary,
  getAllPendingObligations,
} from "./services/paymentService.js";
import { getCurrentUser, logout } from "./services/authService.js";

async function loadDashboard() {
  const user = getCurrentUser();

  if (!user || user.type !== "admin") {
    window.location.href = "/login.html";
    return;
  }

  // Load kas balance
  const balanceResult = await getKasBalance();
  if (balanceResult.success) {
    document.getElementById("kasBalance").textContent = formatRp(
      balanceResult.balance,
    );
  }

  // Load payment summary
  const paymentResult = await getPaymentSummary();
  if (paymentResult.success) {
    document.getElementById("totalCollected").textContent = formatRp(
      paymentResult.data.total_collected,
    );
  }

  // Load pending obligations
  const pendingResult = await getAllPendingObligations();
  if (pendingResult.success) {
    document.getElementById("pendingCount").textContent =
      pendingResult.data.length;

    const totalAmount = pendingResult.data.reduce(
      (sum, o) => sum + o.amount,
      0,
    );
    document.getElementById("totalObligations").textContent =
      formatRp(totalAmount);
  }

  // Load recent transactions
  const txResult = await getTransactions({ limit: 20 });
  if (txResult.success) {
    const tbody = document.querySelector("#recentTransactions tbody");
    tbody.innerHTML = "";

    txResult.data.forEach((tx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(tx.transaction_date).toLocaleDateString("id-ID")}</td>
        <td>${tx.type === "deposit" ? "📥 In" : "📤 Out"}</td>
        <td>${formatRp(Math.abs(tx.amount))}</td>
        <td>${tx.category?.name || "-"}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

function formatRp(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
  window.location.href = "/login.html";
});

document.addEventListener("DOMContentLoaded", loadDashboard);
```

### CSS

```css
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.card .value {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
}

.tables-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f5f5f5;
  font-weight: bold;
}
```

---

All these patterns are ready to copy and integrate into your application!

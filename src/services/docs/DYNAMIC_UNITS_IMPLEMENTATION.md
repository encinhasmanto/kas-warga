# Dynamic Units Loading Implementation

## Overview

This implementation replaces hardcoded radio button lists in the Iuran payment form with dynamically generated options from the Supabase `units` table. This means whenever you update the units table, the form automatically reflects those changes.

---

## How It Works (Step by Step)

### **Step 1: Global Variables**

```javascript
let allUnits = [];
let unitsByCategory = {};
```

- `allUnits`: Stores all units fetched from Supabase
- `unitsByCategory`: Organizes units by category (Ruko, Rumah) for quick lookup

---

### **Step 2: Fetch Units from Supabase**

```javascript
async function fetchUnitsFromSupabase() {
  const { data, error } = await supabase
    .from("units")
    .select("id, code, display_name, category, unit_type")
    .order("no_sequence_unit", { ascending: true });
```

**What it does:**

- Queries the `units` table from Supabase
- Fetches: `id`, `code` (R1, A1, B2, etc), `display_name` (person name), `category` (Ruko/Rumah), and `unit_type` (A/B)
- Sorts by `no_sequence_unit` to maintain correct order

**Expected Data Structure:**

```
units table example:
| id | code | display_name  | category | unit_type | no_sequence_unit |
|----|------|---------------|----------|-----------|------------------|
| 1  | R1   | Seblak Nasir  | Ruko     | null      | 1                |
| 2  | R2   | Seblak Nasir  | Ruko     | null      | 2                |
| 3  | A1   | Reza          | Rumah    | A         | 1                |
| 4  | A2   | Oma Yeti      | Rumah    | A         | 2                |
| 5  | B1   | Satya         | Rumah    | B         | 1                |
```

---

### **Step 3: Organize Units by Category**

```javascript
unitsByCategory = {};
allUnits.forEach((unit) => {
  if (!unitsByCategory[unit.category]) {
    unitsByCategory[unit.category] = [];
  }
  unitsByCategory[unit.category].push(unit);
});
```

**Result:**

```javascript
unitsByCategory = {
  "Ruko": [
    { id: 1, code: "R1", display_name: "Seblak Nasir", ... },
    { id: 2, code: "R2", display_name: "Seblak Nasir", ... }
  ],
  "Rumah": [
    { id: 3, code: "A1", display_name: "Reza", unit_type: "A", ... },
    { id: 4, code: "A2", display_name: "Oma Yeti", unit_type: "A", ... },
    { id: 5, code: "B1", display_name: "Satya", unit_type: "B", ... }
  ]
}
```

---

### **Step 4: Create Radio Label Dynamically**

```javascript
function createRadioLabel(unit, radioName) {
  const value = `${unit.code} - ${unit.display_name}`;
  const label = document.createElement("label");
  label.innerHTML = `
    <input type="radio" name="${radioName}" value="${value}" />
    <strong>${unit.code}</strong> -&nbsp;<strong>${unit.display_name}</strong>
  `;
  return label;
}
```

**What it does:**

- Takes a unit object and creates an HTML label with a radio button
- Format: "R1 - Seblak Nasir" (same format as before, for consistency)
- Accepts `radioName` parameter to use different names (blockRukoNo, blockRumahNo, etc)

---

### **Step 5: Populate Ruko Options**

```javascript
function populateRukoOptions() {
  const blockRuko = document.getElementById("blockRuko");
  const rukoUnits = unitsByCategory["Ruko"] || [];

  blockRuko.innerHTML = ""; // Clear old options

  rukoUnits.forEach((unit) => {
    blockRuko.appendChild(createRadioLabel(unit, "blockRukoNo"));
  });
}
```

**What it does:**

- Gets all Ruko units from `unitsByCategory`
- Clears the HTML container
- Loops through each unit and adds a new radio button

---

### **Step 6: Populate Rumah A Options**

```javascript
function populateRumahAOptions() {
  const blockRumahTypeA = document.getElementById("blockRumahTypeA");
  const rumahUnits = unitsByCategory["Rumah"] || [];

  const typeAUnits = rumahUnits.filter((u) => u.unit_type === "A");

  blockRumahTypeA.innerHTML = "";

  typeAUnits.forEach((unit) => {
    blockRumahTypeA.appendChild(createRadioLabel(unit, "blockRumahNo"));
  });
}
```

**What it does:**

- Gets all Rumah units
- **Filters** to only get type A units (u.unit_type === "A")
- Populates blockRumahTypeA with only those units

---

### **Step 7: Populate Rumah B Options**

```javascript
function populateRumahBOptions() {
  const blockRumahTypeB = document.getElementById("blockRumahTypeB");
  const rumahUnits = unitsByCategory["Rumah"] || [];

  const typeBUnits = rumahUnits.filter((u) => u.unit_type === "B");

  blockRumahTypeB.innerHTML = "";

  typeBUnits.forEach((unit) => {
    blockRumahTypeB.appendChild(createRadioLabel(unit, "blockRumahNo"));
  });
}
```

**What it does:**

- Same as Step 6, but filters for type B units only

---

### **Step 8: Main Populate Function**

```javascript
function populateDropdowns() {
  populateRukoOptions();
  populateRumahAOptions();
  populateRumahBOptions();
}
```

**What it does:**

- Central function that calls all population functions
- Used whenever units need to be refreshed

---

### **Step 9: Call on Page Load**

```javascript
document.addEventListener("DOMContentLoaded", function () {
  // ... existing DOMContentLoaded code ...

  // Load units from Supabase on page load
  fetchUnitsFromSupabase();
});
```

**What it does:**

- When the page loads, `fetchUnitsFromSupabase()` is called
- This triggers the entire chain:
  1. Fetch units from Supabase
  2. Organize by category
  3. Populate all three dropdowns

---

## Integration with Transaction Detail

The `transaction.detail` automatically gets the correct format because of how radio buttons work:

```javascript
// In handlePayIuranClick():
const rukoNo = document.querySelector('input[name="blockRukoNo"]:checked');
detail = rukoNo.value; // Gets "R1 - Seblak Nasir"

// This is then stored in the transaction
const newTransaction = {
  type: "Deposit",
  amount,
  detail, // "R1 - Seblak Nasir" comes from radio value
  time: new Date().toISOString(),
};
```

---

## Benefits of This Approach

✅ **Single Source of Truth**: Units are managed in Supabase  
✅ **No Hardcoding**: Add/remove units in the database, not in code  
✅ **Real-time Updates**: Changes in units table reflect immediately  
✅ **Type Safety**: Filtering by `unit_type` keeps A and B separate  
✅ **Scalable**: Easily handles new units or categories  
✅ **Maintainable**: Clean, simple functions with clear purposes

---

## Database Requirements

Your Supabase `units` table must have these columns:

| Column           | Type    | Notes                                   |
| ---------------- | ------- | --------------------------------------- |
| id               | uuid    | Primary key                             |
| code             | text    | "R1", "A1", "B2", etc                   |
| display_name     | text    | Person name like "Reza", "Seblak Nasir" |
| category         | text    | "Ruko" or "Rumah" or "THR"              |
| unit_type        | text    | "A", "B", or null (for Ruko)            |
| no_sequence_unit | integer | For ordering (1, 2, 3...)               |

---

## Future Enhancements

When you implement THR (question #6), you'll add:

```javascript
function populateTHROptions() {
  const blockTHR = document.getElementById("blockTHR");
  const thrUnits = unitsByCategory["THR"] || [];

  // Group by display_name to deduplicate
  const uniqueNames = [...new Set(thrUnits.map((u) => u.display_name))];

  blockTHR.innerHTML = "";

  uniqueNames.forEach((name) => {
    // Create single radio for Satya that covers A12 and B1
  });
}
```

---

## Testing

To verify this is working:

1. Open Developer Console (F12)
2. Look for this message:
   ```
   Units loaded: { Ruko: [...], Rumah: [...] }
   ```
3. Verify the radio buttons appear when you select Ruko/Rumah/A/B
4. Try adding a new unit in Supabase and refresh the page - it should appear automatically

---

## Troubleshooting

**Issue: Radio buttons not appearing**

- Check browser console for errors
- Verify Supabase connection is working
- Ensure `units` table exists with correct column names

**Issue: Wrong units showing**

- Check `unit_type` field in database (case-sensitive: "A" not "a")
- Verify `category` field is exactly "Rumah" or "Ruko"

**Issue: Units in wrong order**

- Check `no_sequence_unit` values in database
- They should be sequential integers: 1, 2, 3...

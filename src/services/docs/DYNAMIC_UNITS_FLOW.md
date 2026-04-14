# Dynamic Units Flow Diagram

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAGE LOADS                                  │
│              (DOMContentLoaded event fires)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         fetchUnitsFromSupabase()                                │
│  - Query Supabase "units" table                                 │
│  - Get: id, code, display_name, category, unit_type            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         Store in Global Variables                               │
│  allUnits = [...]                                              │
│  unitsByCategory = {                                           │
│    "Ruko": [...],                                              │
│    "Rumah": [...]                                              │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         populateDropdowns()                                      │
└──┬─────────────────────────────────────────────┬────────────────┘
   │                                             │
   ▼                                             ▼
populateRukoOptions()              populateRumahOptions()
   │                                      │
   │ Filter:                              │ Filter:
   │ category = "Ruko"                    │ category = "Rumah"
   │                                      │
   ▼                                      ▼
Get Ruko units:                    Split by unit_type:
- R1 - Seblak Nasir                │
- R2 - Seblak Nasir                ├─ Type A: A1, A2, A3...
- R3 - Daily Laudry                │
- ...                              └─ Type B: B1, B2...
   │
   │ Loop each unit:                    Loop Type A:
   │ createRadioLabel(unit)             createRadioLabel(unit)
   │                                    → #blockRumahTypeA
   ▼
#blockRuko                             Loop Type B:
                                       createRadioLabel(unit)
                                       → #blockRumahTypeB
```

---

## User Interaction Flow

```
┌─────────────────────────────────────┐
│  User Selects "Ruko" Radio Button   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  propertyType change event fires    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  blockRuko.style.display = "flex"   │
│  Show: R1, R2, R3... (from DB)      │
└─────────────────────────────────────┘


┌─────────────────────────────────────┐
│  User Selects "Rumah" Radio Button  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  propertyType change event fires    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  blockRumah.style.display = "flex"  │
│  Show: A, B options                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  User Selects "A" or "B"            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  blockRumahType change event fires  │
└────────────┬────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
If "A":         If "B":
Show A1-A12     Show B1-B10
(from DB)       (from DB)
```

---

## createRadioLabel Function In Detail

```javascript
INPUT:
  unit = {
    id: 3,
    code: "A1",
    display_name: "Reza",
    category: "Rumah",
    unit_type: "A"
  }
  radioName = "blockRumahNo"

PROCESS:
  value = `${unit.code} - ${unit.display_name}`
       = "A1 - Reza"

  Create DOM element:
  <label>
    <input type="radio" name="blockRumahNo" value="A1 - Reza" />
    <strong>A1</strong> -&nbsp;<strong>Reza</strong>
  </label>

OUTPUT:
  DOM Label element ready to append to #blockRumahTypeA
```

---

## Transaction Detail Value Creation

```
User selects radio: "R1 - Seblak Nasir"
             │
             ▼
document.querySelector('input[name="blockRukoNo"]:checked')
             │
             ▼
rukoNo.value = "R1 - Seblak Nasir"
             │
             ▼
detail = rukoNo.value
             │
             ▼
newTransaction = {
  type: "Deposit",
  amount: 250000,
  detail: "R1 - Seblak Nasir",  ← From database!
  time: new Date().toISOString()
}
             │
             ▼
Stored in Supabase transactions table
```

---

## Comparison: Before vs After

### BEFORE (Hardcoded)

```javascript
// In index.html - manually added 100+ radio buttons
<label>
  <input type="radio" name="blockRukoNo" value="R1 - Seblak Nasir" />
  R1 -&nbsp;<strong>Seblak Nasir</strong>
</label>
// ... repeat 10+ times manually ...

❌ Problem: To add R12, must edit HTML file
❌ Problem: Dropdown doesn't match database
❌ Problem: Manual maintenance nightmare
```

### AFTER (Dynamic)

```javascript
// In script.js - automatically populated
const rukoUnits = unitsByCategory["Ruko"];
rukoUnits.forEach((unit) => {
  blockRuko.appendChild(createRadioLabel(unit, "blockRukoNo"));
});

✅ Solution: Add unit to database, automatically appears
✅ Solution: Always matches database
✅ Solution: Zero HTML editing needed
```

---

## Example Database Scenarios

### Scenario 1: Add New Ruko

```
DATABASE UPDATE:
INSERT INTO units (code, display_name, category, unit_type, no_sequence_unit)
VALUES ('R12', 'New Shop', 'Ruko', null, 12);

RESULT:
Next page load → R12 appears in Ruko dropdown automatically ✓
```

### Scenario 2: Change Person Name

```
DATABASE UPDATE:
UPDATE units SET display_name = 'Reza Wijaya' WHERE code = 'A1';

RESULT:
Next page load → Shows "A1 - Reza Wijaya" instead of "A1 - Reza" ✓
Any existing transactions still show old value ✓
```

### Scenario 3: Add New Rumah Type A

```
DATABASE UPDATE:
INSERT INTO units (code, display_name, category, unit_type, no_sequence_unit)
VALUES ('A13', 'Budi Santoso', 'Rumah', 'A', 13);

RESULT:
Next page load → A13 appears in Type A dropdown ✓
Not in Type B dropdown (correct filtering) ✓
```

---

## Key Concepts

### **Category vs Unit Type**

```
category: Determines which section (Ruko/Rumah/THR)
unit_type: For Rumah, distinguishes A vs B units

Example:
- R1: category="Ruko", unit_type=null (no type needed)
- A1: category="Rumah", unit_type="A" (separates from B)
- B1: category="Rumah", unit_type="B" (separates from A)
```

### **Radio Name vs Radio Value**

```
name="blockRukoNo"        ← Groups related radios (only one can be selected)
value="R1 - Seblak Nasir" ← Actual data sent when form submitted

Different names ensure separate selection groups:
- Ruko section uses name="blockRukoNo"
- Rumah section uses name="blockRumahNo"
```

### **Filter Operations**

```
// Filter Rumah to only Type A
const typeAUnits = rumahUnits.filter((u) => u.unit_type === "A");

This creates a NEW array with only items matching the condition:
rumahUnits = [A1, A2, A3, B1, B2, B3]
               ↓
typeAUnits = [A1, A2, A3]
```

---

## Performance Notes

**Initial Load:**

- Single Supabase query fetches all units
- Grouped by category in JavaScript (instant)
- Dropdown population happens in ~10ms

**On Change:**

- No network requests needed
- All data already in memory (`unitsByCategory`)
- DOM updates are immediate

**Memory Usage:**

- Storing 50-100 units in JavaScript is negligible
- Re-organizing on each fetch is cheaper than querying per category

---

## Debugging Tips

### Check if units loaded:

```javascript
console.log(allUnits); // Should show array of unit objects
console.log(unitsByCategory); // Should show organized by category
```

### Verify specific dropdown:

```javascript
console.log(document.getElementById("blockRuko").children);
// Should show 11+ child elements (labels)
```

### Check individual radio value:

```javascript
document.querySelector('input[name="blockRukoNo"]:checked')?.value;
// Should print: "R1 - Seblak Nasir"
```

### Force refresh dropdowns:

```javascript
populateDropdowns();
// Clears and repopulates all three sections
```

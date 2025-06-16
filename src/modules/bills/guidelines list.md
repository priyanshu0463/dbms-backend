# SQL Operations Analysis - Complete Breakdown

## 1. Aggregate Functions ✅ (Multiple Uses)

**Found in queries:** 6, 8, 13, 14, 16

### Examples:
- `COUNT(*)` - Count all records
- `COUNT(b.bill_id)` - Count specific column
- `COUNT(DISTINCT b.user_id)` - Count unique values
- `SUM(b.total_amount)` - Sum of amounts
- `AVG(b.total_amount)` - Average calculation
- `MIN(b.total_amount)` - Minimum value
- `MAX(b.total_amount)` - Maximum value

**Total Different Aggregate Functions Used: 7**

---

## 2. GROUP BY...HAVING ✅ (Multiple Uses)

**Found in queries:** 8, 13, 14, 16

### Examples:
- Query 8: `GROUP BY b.bill_id, u.first_name, u.last_name, sm.meter_serial_number, uc.company_name HAVING COUNT(b.bill_id) > 0`
- Query 13: `GROUP BY b.user_id, EXTRACT(YEAR FROM b.created_at) HAVING COUNT(b.bill_id) > 0`
- Query 14: `HAVING SUM(units_consumed) > 1000`
- Query 16: `HAVING COUNT(b.bill_id) > 0`

**Total GROUP BY...HAVING Combinations: 4**

---

## 3. ORDER BY ✅ (Multiple Uses)

**Found in queries:** 2, 3, 4, 5, 6, 8, 9, 14, 15, 16

### Examples:
- `ORDER BY b.created_at DESC` - Sort by date, newest first
- `ORDER BY b.due_date ASC` - Sort by due date, oldest first
- `ORDER BY category, total_units DESC NULLS LAST` - Multiple column sorting
- Complex ordering with CASE statements in Query 15

**Total ORDER BY Clauses: 10**

---

## 4. JOIN Operations ✅ (Extensive Use)

**Found in queries:** 2, 3, 4, 5, 6, 7, 8, 15, 16

### INNER JOIN Examples:
- `INNER JOIN users u ON b.user_id = u.user_id`
- `INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id`
- `INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id`

**Total INNER JOIN Operations: 27**

---

## 5. OUTER JOIN (LEFT JOIN) ✅ (Present)

**Found in query:** 5

### Example:
```sql
LEFT JOIN users u ON b.user_id = u.user_id
LEFT JOIN smart_meters sm ON b.meter_id = sm.meter_id
LEFT JOIN utility_companies uc ON b.utility_id = uc.utility_id
```

**Total LEFT JOIN Operations: 3**

---

## 6. Boolean Operators ✅ (Extensive Use)

**Found in queries:** 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16

### Examples:
- **AND**: `WHERE b.bill_id = $1 AND EXISTS (...)`
- **OR**: `AND (u.status = 'active' OR u.status = 'suspended')`
- **NOT**: `AND b.bill_status NOT IN ('disputed', 'cancelled')`

**Total Boolean Operations: 35+**

---

## 7. Arithmetic Operators ✅ (Present)

**Found in queries:** 9, 13, 16

### Examples:
- `CURRENT_DATE - b.due_date as days_overdue` (Subtraction)
- `b.energy_charges + b.fixed_charges` (Addition)
- `COUNT(...) * 100.0 / COUNT(...)` (Multiplication and Division)

**Total Arithmetic Operations: 6**

---

## 8. String Operators ✅ (Multiple Uses)

**Found in queries:** 7, 15

### Examples:
- `UPPER(b.bill_number) = UPPER($1)` - Case conversion
- `ILIKE` - Case-insensitive pattern matching
- `LIKE` - Pattern matching
- `CONCAT(b.bill_number, '%')` - String concatenation
- `u.first_name || ' ' || u.last_name` - String concatenation operator

**Total String Operations: 15+**

---

## 9. TO_CHAR and EXTRACT ✅ (Multiple Uses)

**Found in queries:** 8, 13, 14, 16

### TO_CHAR Examples:
- `TO_CHAR(b.created_at, 'YYYY-MM') as billing_month`

### EXTRACT Examples:
- `EXTRACT(YEAR FROM b.created_at) as billing_year`
- `EXTRACT(MONTH FROM b.created_at) as month_number`
- `EXTRACT(QUARTER FROM b.created_at) as quarter`

**Total TO_CHAR/EXTRACT Operations: 8**

---

## 10. BETWEEN ✅ (Multiple Uses)

**Found in queries:** 9, 13

### Examples:
- `WHERE b.due_date BETWEEN '1900-01-01' AND CURRENT_DATE`
- `AND b.total_amount NOT BETWEEN 0 AND 0.01`

**Total BETWEEN Operations: 2**

---

## 11. IN / NOT IN ✅ (Multiple Uses)

**Found in queries:** 5, 6

### Examples:
- `AND b.bill_status IN ('generated', 'sent', 'paid')`
- `AND b.bill_status NOT IN ('disputed', 'cancelled')`

**Total IN/NOT IN Operations: 2**

---

## 12. Set Operations ✅ (Present)

**Found in query:** 14

### Example:
```sql
SELECT 'high_consumption' as category, user_id, SUM(units_consumed) as total_units
FROM bills 
WHERE utility_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
GROUP BY user_id
HAVING SUM(units_consumed) > 1000

UNION ALL

SELECT 'high_amount' as category, user_id, SUM(total_amount) as total_amount
FROM bills
WHERE utility_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
GROUP BY user_id
HAVING SUM(total_amount) > 10000
```

**Total Set Operations: 1 (UNION ALL)**

---

## 13. Subqueries with EXISTS/NOT EXISTS ✅ (Multiple Uses)

**Found in queries:** 3, 7, 10, 12

### EXISTS Examples:
- `AND EXISTS (SELECT 1 FROM users u2 WHERE u2.user_id = b.user_id AND u2.status = 'active')`
- `AND EXISTS (SELECT 1 FROM bills WHERE bill_id = $1 AND bill_status != 'paid')`

### NOT EXISTS Examples:
- `AND NOT EXISTS (SELECT 1 FROM bills b2 WHERE b2.bill_number LIKE CONCAT(b.bill_number, '%') AND b2.bill_id != b.bill_id)`

**Total EXISTS/NOT EXISTS Operations: 4**

---

## 14. Subqueries with ANY/ALL ✅ (Present)

**Found in queries:** 10, 11

### ANY Example:
- `AND bill_id = ANY(SELECT bill_id FROM bills WHERE bill_status != 'paid')`

### ALL Example:
- `AND total_amount > ALL(SELECT COALESCE(subsidy_amount, 0) FROM bills WHERE bill_id = $1)`

**Total ANY/ALL Operations: 2**

---

## SUMMARY TABLE

| Operation Type | Count | Status |
|----------------|-------|---------|
| Aggregate Functions | 7 different types | ✅ Present |
| GROUP BY...HAVING | 4 combinations | ✅ Present |
| ORDER BY | 10 clauses | ✅ Present |
| JOIN (INNER) | 27 operations | ✅ Present |
| OUTER JOIN (LEFT) | 3 operations | ✅ Present |
| Boolean Operators | 35+ operations | ✅ Present |
| Arithmetic Operators | 6 operations | ✅ Present |
| String Operators | 15+ operations | ✅ Present |
| TO_CHAR/EXTRACT | 8 operations | ✅ Present |
| BETWEEN | 2 operations | ✅ Present |
| IN/NOT IN | 2 operations | ✅ Present |
| Set Operations | 1 operation | ✅ Present |
| EXISTS/NOT EXISTS | 4 operations | ✅ Present |
| ANY/ALL | 2 operations | ✅ Present |

## FINAL ANSWER

**ALL 14 TYPES OF OPERATIONS ARE PRESENT IN THE SQL QUERIES!**

The SQL queries demonstrate a comprehensive use of advanced database operations, making this a very well-rounded and sophisticated set of database interactions that covers virtually every major SQL operation category.
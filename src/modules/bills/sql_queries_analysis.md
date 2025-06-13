# SQL Queries Analysis - Beginner-Friendly Guide

## Understanding Basic SQL Concepts First

### What is SQL?
SQL (Structured Query Language) is like asking questions to a database. Think of a database as a digital filing cabinet with multiple folders (tables), and SQL helps you find, add, update, or remove information from these folders.

### Key Terms Explained:
- **Table**: Like a spreadsheet with rows and columns
- **Column**: A category of information (like "Name" or "Age")
- **Row**: One complete record (like one person's information)
- **Primary Key**: A unique identifier for each row (like a person's ID number)
- **Foreign Key**: A reference to another table's primary key (like referencing a customer ID in an order)

---

## 1. Create Bill Query (Method: `create`)

```sql
INSERT INTO bills (
  user_id, meter_id, utility_id, bill_number, billing_period_start, 
  billing_period_end, previous_reading, current_reading, units_consumed,
  energy_charges, fixed_charges, peak_charges, off_peak_charges,
  tax_amount, subsidy_amount, total_amount, due_date, bill_status
) VALUES (
  $1::integer, $2::integer, $3::integer, $4::varchar, $5::date, 
  $6::date, $7::decimal, $8::decimal, $9::decimal,
  $10::decimal, $11::decimal, $12::decimal, $13::decimal,
  $14::decimal, $15::decimal, $16::decimal, $17::date, $18::bills_bill_status_enum
) RETURNING *
```

**Simple Explanation**: This is like filling out a new electricity bill form and filing it.

**Breaking it down**:
- **INSERT INTO bills**: "Put new information into the bills table"
- **($1, $2, $3...)**: These are placeholders for actual values (like form fields)
- **$1::integer**: 
  - `$1` = "First piece of information I'm giving you"
  - `::integer` = "Make sure this is treated as a whole number"
  - Think of it like saying "This should be a number, not text"
- **varchar**: Text that can vary in length (like a name)
- **decimal**: Numbers with decimal points (like $123.45)
- **date**: Calendar dates (like 2024-01-15)
- **RETURNING ***: "After you save this, show me the complete record you just created"

**Real-world analogy**: Like a cashier scanning items, entering them into the system, and then printing a receipt showing everything that was recorded.

---

## 2. Find All Bills Query (Method: `findAll`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name, u.email, u.customer_id,
  sm.meter_serial_number, sm.meter_type,
  uc.company_name, uc.company_code
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
ORDER BY b.created_at DESC
```

**Simple Explanation**: Get all bills and show related customer, meter, and company information together.

**Breaking it down**:
- **SELECT**: "I want to see these specific pieces of information"
- **b.\***: "Everything from the bills table" (b is a nickname for bills)
- **FROM bills b**: "Look in the bills table, and I'll call it 'b' for short"
- **INNER JOIN**:
  - Think of this like connecting puzzle pieces
  - You have a bills table and a users table
  - Bills have a user_id, users have a user_id
  - INNER JOIN connects rows where these IDs match
  - It's like saying "Show me bills, but also include the customer's name from the users table"
- **ON b.user_id = u.user_id**: "Connect bills to users where the user IDs match"
- **ORDER BY b.created_at DESC**: "Sort by creation date, newest first"

**Real-world analogy**: Like looking at your phone bill but also wanting to see your account details, address, and phone company info all on one page instead of separate papers.

---

## 3. Find One Bill Query (Method: `findOne`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name, u.email, u.customer_id,
  sm.meter_serial_number, sm.meter_type,
  uc.company_name, uc.company_code
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE b.bill_id = $1
AND EXISTS (
  SELECT 1 FROM users u2 WHERE u2.user_id = b.user_id AND u2.status = 'active'
)
```

**Simple Explanation**: Find one specific bill, but only if the customer account is still active.

**Breaking it down**:
- **WHERE b.bill_id = $1**: "Only show the bill with this specific ID number"
- **EXISTS**:
  - Like asking "Does this condition exist?"
  - It's a safety check
  - Think of it like "Before showing this bill, make sure the customer account is still active"
- **SELECT 1**: This is just checking if a record exists (1 is just a placeholder)

**Real-world analogy**: Like asking for a specific invoice, but the clerk first checks if your account is in good standing before showing it to you.

---

## 4. Find Bills by User ID Query (Method: `findByUserId`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name, u.email,
  sm.meter_serial_number,
  uc.company_name
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE b.user_id = $1 
AND (u.status = 'active' OR u.status = 'suspended')
AND b.bill_status IS NOT NULL
ORDER BY b.created_at DESC
```

**Simple Explanation**: Show all bills for one specific customer, but only if their account is active or suspended (not closed).

**Breaking it down**:
- **WHERE b.user_id = $1**: "Only bills for this specific customer"
- **AND (u.status = 'active' OR u.status = 'suspended')**:
  - **AND**: "Plus this condition must also be true"
  - **OR**: "Either this OR that is acceptable"
  - Like saying "Customer must be either active or temporarily suspended, but not closed"
- **IS NOT NULL**: "Must have some status (not blank)"

**Real-world analogy**: Like asking for all your electricity bills from the past year, but only if your account is still in the system.

---

## 5. Find Bills by Meter ID Query (Method: `findByMeterId`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name,
  sm.meter_serial_number, sm.status as meter_status,
  uc.company_name
FROM bills b
LEFT JOIN users u ON b.user_id = u.user_id
LEFT JOIN smart_meters sm ON b.meter_id = sm.meter_id
LEFT JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE b.meter_id = $1
AND b.bill_status IN ('generated', 'sent', 'paid')
ORDER BY b.created_at DESC
```

**Simple Explanation**: Find all bills for a specific electric meter.

**Breaking it down**:
- **LEFT JOIN vs INNER JOIN**:
  - **INNER JOIN**: Only shows records where both tables have matching data (like requiring both puzzle pieces to fit)
  - **LEFT JOIN**: Shows all records from the left table (bills), even if there's no matching data in the right table
  - Think of it like "Show all bills for this meter, even if some customer info might be missing"
- **IN ('generated', 'sent', 'paid')**: "Only bills with these specific statuses"
- **as meter_status**: "Call this column 'meter_status' in the results" (giving it a nickname)

**Real-world analogy**: Like looking at all the bills for a specific electric meter at a property, even if some bills might not have complete customer information.

---

## 6. Find Bills by Utility ID Query (Method: `findByUtilityId`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name,
  sm.meter_serial_number,
  uc.company_name,
  COUNT(*) OVER (PARTITION BY b.user_id) as user_bill_count
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE b.utility_id = $1
AND b.bill_status NOT IN ('disputed', 'cancelled')
ORDER BY b.created_at DESC
```

**Simple Explanation**: Show all bills for a specific utility company, plus count how many bills each customer has.

**Breaking it down**:
- **COUNT(\*) OVER (PARTITION BY b.user_id)**:
  - This is a "window function" - like looking through a window to see additional information
  - **COUNT(\*)**: Count how many records
  - **PARTITION BY b.user_id**: "Group by each customer and count separately"
  - Think of it like "For each bill shown, also tell me how many total bills this customer has"
- **NOT IN ('disputed', 'cancelled')**: "Exclude bills with these statuses"

**Real-world analogy**: Like a utility company manager looking at all their bills, but also wanting to see which customers have the most bills without including problem bills.

---

## 7. Find Bill by Bill Number Query (Method: `findByBillNumber`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name, u.email,
  sm.meter_serial_number,
  uc.company_name
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE UPPER(b.bill_number) = UPPER($1)
AND NOT EXISTS (
  SELECT 1 FROM bills b2 
  WHERE b2.bill_number LIKE CONCAT(b.bill_number, '%') 
  AND b2.bill_id != b.bill_id
)
```

**Simple Explanation**: Find a bill by its bill number, making sure there are no duplicates.

**Breaking it down**:
- **UPPER(b.bill_number) = UPPER($1)**:
  - **UPPER()**: Converts text to uppercase
  - This makes the search case-insensitive (BILL123 matches bill123)
- **NOT EXISTS**: "Make sure this condition does NOT exist"
- **LIKE**: Pattern matching (like searching)
- **CONCAT(b.bill_number, '%')**: 
  - **CONCAT**: Joins text together
  - **%**: Wildcard meaning "anything after this"
  - Like searching for "BILL123*" to find BILL123A, BILL123B, etc.
- **b2.bill_id != b.bill_id**: "Don't count the bill we're already looking at"

**Real-world analogy**: Like looking up an invoice number, but making sure you don't accidentally have duplicate invoice numbers in your filing system.

---

## 8. Find Bills by Status Query (Method: `findByStatus`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name,
  sm.meter_serial_number,
  uc.company_name,
  TO_CHAR(b.created_at, 'YYYY-MM') as billing_month,
  EXTRACT(YEAR FROM b.created_at) as billing_year
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE b.bill_status = $1
GROUP BY b.bill_id, u.first_name, u.last_name, sm.meter_serial_number, uc.company_name
HAVING COUNT(b.bill_id) > 0
ORDER BY b.created_at DESC
```

**Simple Explanation**: Find all bills with a specific status (like "unpaid") and format the dates nicely.

**Breaking it down**:
- **TO_CHAR(b.created_at, 'YYYY-MM')**:
  - **TO_CHAR**: Convert something to text
  - **'YYYY-MM'**: Format as "2024-01" (year-month)
  - Like converting "January 15, 2024" to "2024-01"
- **EXTRACT(YEAR FROM b.created_at)**: Pull out just the year (2024)
- **GROUP BY**: 
  - Like organizing papers into piles
  - "Group together bills that have the same values for these columns"
- **HAVING COUNT(b.bill_id) > 0**: 
  - **HAVING**: Like WHERE, but used after GROUP BY
  - "Only show groups that have at least one bill"

**Real-world analogy**: Like organizing all unpaid bills by customer and showing what year and month each bill is from.

---

## 9. Find Overdue Bills Query (Method: `findOverdueBills`)

```sql
SELECT 
  b.*,
  u.first_name, u.last_name, u.phone, u.email,
  sm.meter_serial_number,
  uc.company_name,
  CURRENT_DATE - b.due_date as days_overdue
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE b.due_date BETWEEN '1900-01-01' AND CURRENT_DATE
AND b.bill_status = 'sent'
AND b.total_amount NOT BETWEEN 0 AND 0.01
AND (b.payment_date IS NULL OR b.payment_date > b.due_date)
ORDER BY b.due_date ASC
```

**Simple Explanation**: Find bills that are past their due date and haven't been paid.

**Breaking it down**:
- **CURRENT_DATE - b.due_date as days_overdue**: 
  - **CURRENT_DATE**: Today's date
  - Subtract due date from today to calculate how many days overdue
- **BETWEEN '1900-01-01' AND CURRENT_DATE**: 
  - **BETWEEN**: In the range from this to that
  - "Due date is between 1900 and today" (basically any valid date)
- **NOT BETWEEN 0 AND 0.01**: "Amount is not between 0 and 1 cent" (significant amounts only)
- **b.payment_date IS NULL**: "No payment date recorded"
- **b.payment_date > b.due_date**: "Payment was made after the due date"

**Real-world analogy**: Like looking through all your bills to find which ones are past due and how many days late they are.

---

## 10. Update Bill Query (Method: `update`)

```sql
UPDATE bills 
SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
WHERE bill_id = $1
AND bill_id = ANY(
  SELECT bill_id FROM bills WHERE bill_status != 'paid'
)
```

**Simple Explanation**: Change information on a bill, but only if it hasn't been paid yet.

**Breaking it down**:
- **UPDATE bills SET**: "Change the information in the bills table"
- **${updateFields.join(', ')}**: This is dynamic - it builds the update based on what fields need changing
- **CURRENT_TIMESTAMP**: Current date and time
- **ANY(SELECT...)**: 
  - **ANY**: "If the bill ID matches any of these"
  - Like saying "Only update if this bill is in the list of unpaid bills"

**Real-world analogy**: Like editing a bill, but only if it hasn't been paid yet (you can't change a paid bill).

---

## 11. Mark Bill as Paid Query (Method: `markAsPaid`)

```sql
UPDATE bills 
SET bill_status = 'paid', 
    payment_date = CURRENT_TIMESTAMP
WHERE bill_id = $1
AND total_amount > ALL(
  SELECT COALESCE(subsidy_amount, 0) FROM bills WHERE bill_id = $1
)
```

**Simple Explanation**: Mark a bill as paid, but only if the bill amount is more than any subsidies.

**Breaking it down**:
- **ALL(SELECT...)**: 
  - **ALL**: "Must be greater than all values in this list"
  - Like saying "The bill amount must be more than the subsidy"
- **COALESCE(subsidy_amount, 0)**: 
  - **COALESCE**: "Use the first non-null value"
  - If subsidy_amount is null, use 0 instead
  - Like saying "If there's no subsidy recorded, treat it as $0"

**Real-world analogy**: Like marking a bill as paid, but first checking that there's actually an amount to pay after any discounts.

---

## 12. Delete Bill Query (Method: `remove`)

```sql
DELETE FROM bills 
WHERE bill_id = $1
AND EXISTS (
  SELECT 1 FROM bills WHERE bill_id = $1 AND bill_status != 'paid'
)
```

**Simple Explanation**: Delete a bill, but only if it hasn't been paid yet.

**Breaking it down**:
- **DELETE FROM bills**: "Remove records from the bills table"
- The EXISTS check ensures you can only delete unpaid bills

**Real-world analogy**: Like shredding an invoice, but only if it hasn't been paid yet (you need to keep records of paid bills).

---

## 13. Bill Summary Query (Method: `getBillSummary`)

```sql
SELECT 
  COUNT(b.bill_id) as total_bills,
  SUM(b.total_amount) as total_amount,
  SUM(b.units_consumed) as total_units,
  AVG(b.total_amount) as avg_amount,
  MIN(b.total_amount) as min_amount,
  MAX(b.total_amount) as max_amount,
  SUM(b.energy_charges + b.fixed_charges) as base_charges,
  SUM(b.peak_charges + b.off_peak_charges) as time_based_charges,
  COUNT(CASE WHEN b.bill_status = 'paid' THEN 1 END) as paid_bills,
  COUNT(CASE WHEN b.bill_status = 'overdue' THEN 1 END) as overdue_bills
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
WHERE b.user_id = $1 
AND EXTRACT(YEAR FROM b.created_at) = $2
GROUP BY b.user_id, EXTRACT(YEAR FROM b.created_at)
HAVING COUNT(b.bill_id) > 0
AND SUM(b.total_amount) > 0
```

**Simple Explanation**: Create a summary report of all bills for one customer in a specific year.

**Breaking it down**:
- **COUNT(b.bill_id)**: "How many bills total"
- **SUM(b.total_amount)**: "Add up all the bill amounts"
- **AVG(b.total_amount)**: "Average bill amount"
- **MIN/MAX**: "Smallest and largest bill amounts"
- **COUNT(CASE WHEN ... THEN 1 END)**: 
  - **CASE WHEN**: Like an if-then statement
  - "If the bill status is 'paid', then count it as 1, otherwise don't count it"
  - This counts only bills with specific statuses

**Real-world analogy**: Like creating an annual summary of your electric bills showing total spent, average bill, highest and lowest bills, etc.

---

## 14. Bill Analytics Query (Method: `getBillAnalytics`)

```sql
-- High consumption users
SELECT 'high_consumption' as category, user_id, SUM(units_consumed) as total_units
FROM bills 
WHERE utility_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
GROUP BY user_id
HAVING SUM(units_consumed) > 1000

UNION ALL

-- High bill amount users  
SELECT 'high_amount' as category, user_id, SUM(total_amount) as total_amount
FROM bills
WHERE utility_id = $1 AND EXTRACT(YEAR FROM created_at) = $2
GROUP BY user_id
HAVING SUM(total_amount) > 10000

ORDER BY category, total_units DESC NULLS LAST
```

**Simple Explanation**: Find customers who either use a lot of electricity OR have high bill amounts.

**Breaking it down**:
- **UNION ALL**: 
  - **UNION**: Combines results from two separate queries
  - **ALL**: Include duplicates (don't remove them)
  - Like combining two different lists into one
- **'high_consumption' as category**: Creates a label to identify which query each result came from
- **NULLS LAST**: When sorting, put null values at the end

**Real-world analogy**: Like creating two lists - one of customers who use lots of electricity, another of customers with high bills - then combining them into one report.

---

## 15. Search Bills Query (Method: `searchBills`)

```sql
SELECT 
  b.*,
  u.first_name || ' ' || u.last_name as full_name,
  sm.meter_serial_number,
  uc.company_name,
  CASE 
    WHEN b.bill_number ILIKE $1 THEN 'exact_match'
    WHEN b.bill_number ILIKE CONCAT($1, '%') THEN 'prefix_match'
    WHEN b.bill_number ILIKE CONCAT('%', $1, '%') THEN 'contains_match'
    ELSE 'other_match'
  END as match_type
FROM bills b
INNER JOIN users u ON b.user_id = u.user_id
INNER JOIN smart_meters sm ON b.meter_id = sm.meter_id  
INNER JOIN utility_companies uc ON b.utility_id = uc.utility_id
WHERE (
  b.bill_number ILIKE CONCAT('%', $1, '%')
  OR u.first_name ILIKE CONCAT('%', $1, '%')
  OR u.last_name ILIKE CONCAT('%', $1, '%')
  OR u.customer_id ILIKE CONCAT('%', $1, '%')
  OR sm.meter_serial_number ILIKE CONCAT('%', $1, '%')
)
ORDER BY 
  CASE match_type
    WHEN 'exact_match' THEN 1
    WHEN 'prefix_match' THEN 2
    WHEN 'contains_match' THEN 3
    ELSE 4
  END,
  b.created_at DESC
```

**Simple Explanation**: Search for bills using any text, and show the best matches first.

**Breaking it down**:
- **||**: Concatenates (joins) text together
- **u.first_name || ' ' || u.last_name**: Joins first name + space + last name
- **ILIKE**: Case-insensitive pattern matching (JOHN matches john)
- **CASE WHEN ... THEN ... END**: 
  - Like a series of if-then-else statements
  - Determines what type of match this is
- **ORDER BY CASE**: Sorts results by match quality (exact matches first)

**Real-world analogy**: Like using a search box that looks through customer names, bill numbers, and meter numbers, then shows the best matches at the top.

---

## 16. Monthly Billing Summary Query (Method: `getMonthlyBillingSummary`)

```sql
SELECT 
  TO_CHAR(b.created_at, 'YYYY-MM') as billing_month,
  EXTRACT(MONTH FROM b.created_at) as month_number,
  EXTRACT(QUARTER FROM b.created_at) as quarter,
  COUNT(b.bill_id) as total_bills,
  COUNT(DISTINCT b.user_id) as unique_customers,
  SUM(b.total_amount) as total_revenue,
  AVG(b.total_amount) as avg_bill_amount,
  SUM(b.units_consumed) as total_units,
  AVG(b.units_consumed) as avg_units,
  SUM(b.energy_charges) as total_energy_charges,
  SUM(b.fixed_charges) as total_fixed_charges,
  SUM(b.peak_charges) as total_peak_charges,
  SUM(b.off_peak_charges) as total_off_peak_charges,
  SUM(b.tax_amount) as total_tax,
  SUM(b.subsidy_amount) as total_subsidy,
  COUNT(CASE WHEN b.bill_status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN b.bill_status = 'overdue' THEN 1 END) as overdue_count,
  ROUND(
    COUNT(CASE WHEN b.bill_status = 'paid' THEN 1 END) * 100.0 / COUNT(b.bill_id), 
    2
  ) as payment_percentage
FROM bills b
WHERE b.utility_id = $1 
AND EXTRACT(YEAR FROM b.created_at) = $2
GROUP BY 
  TO_CHAR(b.created_at, 'YYYY-MM'),
  EXTRACT(MONTH FROM b.created_at),
  EXTRACT(QUARTER FROM b.created_at)
HAVING COUNT(b.bill_id) > 0
ORDER BY month_number
```

**Simple Explanation**: Create a detailed monthly report showing business performance for each month of the year.

**Breaking it down**:
- **COUNT(DISTINCT b.user_id)**: 
  - **DISTINCT**: Don't count duplicates
  - "How many different customers" (not total bills)
- **EXTRACT(QUARTER FROM b.created_at)**: Gets the quarter (1, 2, 3, or 4)
- **ROUND(..., 2)**: Round to 2 decimal places
- **COUNT(...) * 100.0 / COUNT(...)**: Calculate percentage (paid bills ÷ total bills × 100)

**Real-world analogy**: Like creating a monthly business report showing how much money came in, how many customers you served, what your average bill was, and what percentage of bills got paid.

---

## Summary of Key Concepts

### JOIN Types:
- **INNER JOIN**: Only shows records where both tables have matching data
- **LEFT JOIN**: Shows all records from the left table, even if right table has no match

### Parameter Placeholders:
- **$1, $2, $3**: Placeholders for values passed into the query
- **::integer, ::varchar, ::date**: Tell database what type of data to expect

### Comparison Operators:
- **=**: Equals
- **!=**: Not equals
- **>**: Greater than
- **<**: Less than
- **BETWEEN**: In a range
- **IN**: Matches any value in a list
- **LIKE/ILIKE**: Pattern matching (ILIKE is case-insensitive)

### Aggregate Functions:
- **COUNT**: How many
- **SUM**: Add them up
- **AVG**: Average
- **MIN/MAX**: Smallest/largest

### Logical Operators:
- **AND**: Both conditions must be true
- **OR**: Either condition can be true
- **NOT**: Opposite of the condition

This SQL code handles a complete billing system with sophisticated search, reporting, and data management capabilities!
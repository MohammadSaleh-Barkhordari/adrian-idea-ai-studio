

# Add "Balance" Tab to Our Financial Page

## Overview
Add a third "Balance" tab to the existing tabs on `/our-financial` that calculates a Splitwise-style running balance between Barkhordari and Sattari using the existing `our_financial` table data.

## Changes

### File: `src/pages/OurFinancialPage.tsx`

**1. Update TabsList from 2 columns to 3 and add the new tab trigger (line 364):**
- Change `grid-cols-2` to `grid-cols-3`
- Add `<TabsTrigger value="balance">Balance</TabsTrigger>`

**2. Add new imports:**
- `Scale` or `Handshake` icon from lucide-react for the Balance tab visual
- `Avatar, AvatarFallback` from UI components for the two-person visual

**3. Add the new `<TabsContent value="balance">` section after the "records" TabsContent (after line 637):**

This section contains two parts:

**Part A -- Balance Summary Card:**
- Loop through all `financialRecords`, apply the balance logic to compute a net balance number (positive = Barkhordari is owed, negative = Sattari is owed)
- Balance logic (computed via a `useMemo`):
  - Skip if `who_paid === for_who` (paying for yourself)
  - If `for_who === "Both"`: payer gets `+amount/2`, other gets `-amount/2`
  - If `for_who` is the other person: payer gets `+amount`, other gets `-amount`
- Display two names/avatars on left and right with the net amount in between
- Show settlement message: "Sattari owes Barkhordari £X" or "All settled up!"
- Green styling when settled, amber/red when someone owes

**Part B -- Transaction Breakdown Table:**
- Table with columns: Date, Paid By, Amount (in GBP), For Who, Payment For, Barkhordari Effect, Sattari Effect, Running Balance
- Sort records by `transaction_date` ascending to compute running balance
- Each row shows the per-transaction effect (e.g., "+£11.00" / "-£11.00") and cumulative running balance
- Color-code positive (green) and negative (red) amounts

**Part C -- "Settle Up" Button:**
- Only visible when balance is not zero
- On click, inserts a new record into `our_financial` with:
  - `who_paid`: the person who owes
  - `for_who`: the person who is owed
  - `amount`: the absolute balance amount
  - `payment_for`: "Settlement"
  - `transaction_type`: "expense"
  - `currency`: "GBP"
  - `transaction_date`: today
  - `description`: "Balance settlement"
- After insert, reload records and show success toast
- Send push notification to the other user

**4. Balance calculation helper (useMemo):**

```text
For each record in financialRecords:
  - Skip if who_paid === for_who
  - If for_who === "Both":
      barkhordariBalance += (who_paid === "Barkhordari" ? amount/2 : -amount/2)
  - If for_who === "Sattari" && who_paid === "Barkhordari":
      barkhordariBalance += amount
  - If for_who === "Barkhordari" && who_paid === "Sattari":
      barkhordariBalance -= amount

Net balance = barkhordariBalance
  Positive: Sattari owes Barkhordari
  Negative: Barkhordari owes Sattari
  Zero: Settled
```

## No database or backend changes needed
All data comes from the existing `our_financial` table. The "Settle Up" button uses the same `saveFinancialRecord`-style insert that already works.

## Summary

| Item | Change |
|------|--------|
| `OurFinancialPage.tsx` | Add Balance tab with summary card, transaction breakdown table, and Settle Up button |
| New imports | `Scale`/`Handshake` icon, Avatar components |
| Database | No changes |


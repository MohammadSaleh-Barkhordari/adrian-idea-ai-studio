

# Change All User Emails (Auth + Profiles)

## Overview

Update all 5 user email addresses across authentication, profiles table, and hardcoded references in the codebase. Passwords will be preserved -- only the email field changes.

## Email Mapping

| Person | Old Email | New Email |
|--------|-----------|-----------|
| Alireza Teimouri | teimourialireza@yahoo.com | a.teimouri@adrianidea.ir |
| Mohammad Saleh Barkhordari | mosba1991@gmail.com | m.barkhordari@adrianidea.ir |
| Mahmud Firouzi | mahmoodfirouzi96@gmail.com | m.firouzi@adrianidea.ir |
| Ramin Pishali | ramin@pishali.com | r.pishali@adrianidea.ir |
| Raiana Sattari | raianasattari@gmail.com | r.sattari@adrianidea.ir |

---

## Step 1: Create a one-time edge function to update auth emails

Since auth.users cannot be modified via regular SQL, we need a backend function that uses admin privileges to update each user's email while keeping their existing password.

**New file:** `supabase/functions/update-user-emails/index.ts`

This function will:
- Use `supabase.auth.admin.updateUserById(userId, { email: newEmail })` for each user
- Preserve passwords (only the email field is changed)
- Require admin authorization to run
- Return a summary of which updates succeeded

## Step 2: Update profiles table

Run a SQL update to change the email column in the profiles table for all 5 users (matched by their user IDs).

## Step 3: Update hardcoded email references in code

**8 files** contain hardcoded old emails that must be updated:

| File | What to change |
|------|---------------|
| `src/pages/OurLifePage.tsx` | allowedEmails array: update to new emails for Barkhordari and Sattari |
| `src/pages/OurCalendarPage.tsx` | Same allowedEmails array |
| `src/pages/OurTodoPage.tsx` | Same allowedEmails array |
| `src/pages/OurFinancialPage.tsx` | allowedEmails array + "Mosba1991"/"Raianasattari" display names in Select dropdowns |
| `src/pages/DashboardPage.tsx` | specialAccess array for "Our Life" card |
| `supabase/functions/extract-our-financial-fields/index.ts` | "Mosba1991"/"Raianasattari" references in AI prompt |
| `supabase/functions/task-due-reminders/index.ts` | VAPID mailto email |
| `supabase/functions/calendar-event-reminders/index.ts` | VAPID mailto email |

## Step 4: Call the edge function

Invoke the update-user-emails function to apply the auth changes, then delete the function since it's a one-time operation.

---

## Important Notes

- After the email change, users must log in with their **new email** and their **existing password**
- The "Our Life" section (personal finance, calendar, todo) will continue to be restricted to Barkhordari and Sattari (the two users who previously had access as mosba1991 and raianasattari)
- The "who_paid" / "for_who" display names in the financial pages (currently "Mosba1991" and "Raianasattari") will be updated to friendlier names like "Barkhordari" and "Sattari"


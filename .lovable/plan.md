

# Fix Our Financial: Shared Visibility and Storage Upload

## Problem 1: Each User Only Sees Their Own Records
The `our_financial` table has an RLS policy `user_id = auth.uid()` which restricts each user to only their own records. This breaks the Balance tab and View Records -- neither user sees the full picture.

## Problem 2: Storage Upload Fails for Sattari
Sattari has 4 orphaned document records (rows created in the documents table) but zero actual files in storage. There are duplicate storage policies for the `our-life` bucket which will be cleaned up.

## Changes

### 1. Database Migration -- Fix `our_financial` RLS

Replace the current restrictive policy with one that allows BOTH Our Life users to see and manage ALL `our_financial` records:

- DROP the existing "Users can manage own financial records" ALL policy
- CREATE a new SELECT policy allowing both user IDs to read all records
- CREATE a new INSERT policy with WITH CHECK for both user IDs
- CREATE a new UPDATE policy for both user IDs
- CREATE a new DELETE policy for both user IDs

The two user IDs:
- `19db583e-1e4a-4a20-9f3c-591cb2ca3dc7` (Barkhordari)
- `8dd0bb2f-2768-4c1c-9e62-495f36b882d4` (Sattari)

### 2. Database Migration -- Clean Up Duplicate Storage Policies

Remove the three duplicate storage policies for `our-life` bucket:
- DROP "Users can upload to our-life" (duplicate of "Authenticated users can upload to our-life")
- DROP "Users can view our-life" (duplicate of "Authenticated users can view our-life files")
- DROP "Users can delete from our-life" (duplicate of "Authenticated users can delete from our-life")

### 3. Database Migration -- Clean Up Orphaned Document Records

Delete the 4 orphaned document records created by Sattari that have no corresponding storage files.

### 4. No Code Changes Needed

The `loadFinancialRecords()` function already does `select('*')` -- once the RLS policy is updated, both users will automatically see all records. The Balance tab calculation and View Records tab will work correctly for both users.

## Summary

| Item | Change |
|------|--------|
| `our_financial` RLS | Allow both Our Life users to see/manage all records |
| Storage policies | Remove 3 duplicate policies for `our-life` bucket |
| Orphaned data | Clean up 4 document records with no files |
| Code | No changes needed |


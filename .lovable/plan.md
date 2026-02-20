

# Fix "Save Failed" Error on Our Financial Page

## Root Cause

The storage bucket's **id** is `our-life` (lowercase, hyphen), but the display **name** is `Our_Life`. Both the application code and the recently added RLS policies incorrectly use `Our_Life` instead of the actual bucket id `our-life`.

In the storage API, `supabase.storage.from('...')` requires the bucket **id**, not the name. Similarly, RLS policies must match on the actual `bucket_id` column value, which stores the id.

## Changes Required

### 1. Database Migration -- Fix Storage RLS Policies

Drop the three incorrectly-named policies and recreate them using the correct bucket id `our-life`:

- DROP "Authenticated users can upload to Our_Life"
- DROP "Authenticated users can view Our_Life files"
- DROP "Authenticated users can delete from Our_Life"
- CREATE same three policies with `bucket_id = 'our-life'`

### 2. Code Fix -- `src/pages/OurFinancialPage.tsx`

Change line 177:
```
.from('Our_Life')  -->  .from('our-life')
```

### No other files reference this bucket for storage operations.

## Summary

| Item | Change |
|------|--------|
| Database migration | Fix 3 storage policies to use `our-life` instead of `Our_Life` |
| `src/pages/OurFinancialPage.tsx` line 177 | Change `'Our_Life'` to `'our-life'` |


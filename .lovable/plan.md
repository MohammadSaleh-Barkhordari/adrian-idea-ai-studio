

# Add Default Persian Signature to New Emails

When composing a new email (not from the letter builder), the body should be pre-filled with a default Persian signature at the bottom.

## Format

```
باتشکر
{Persian full name}
{Persian job title} شرکت آدرین ایده
```

## Changes

### File: `src/components/email/EmailCompose.tsx`

1. **Fetch sender's Persian info on open** -- When the dialog opens in `mode === 'new'` and there is no `initialBody` (i.e. not coming from the letter builder which already has its own signature), query the `employees` table for the current user's `name_fa`, `surname_fa`, and `job_title_fa` using `userId`.

2. **Build default body with signature** -- Construct a default body string:
   ```
   \n\nباتشکر\n{name_fa} {surname_fa}\n{job_title_fa} شرکت آدرین ایده
   ```
   Set this as the initial `body` value so the user sees the signature pre-filled and can type their message above it.

3. **Skip when prefilled** -- If `initialBody` or `initialBodyHtml` is provided (e.g. from the letter builder), use those instead and do not add the default signature (it already has one).

### No other files need changes
All logic is contained within `EmailCompose.tsx`.


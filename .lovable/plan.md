

# Pre-fill Recipient Email from CRM Contact

When sending a letter by email, the selected contact's email address will be automatically filled in the "To" field, while remaining editable.

## Changes

### 1. Add `email` to CrmContact interface and fetch query
**File: `src/pages/WritingLetterPage.tsx`**
- Add `email: string | null` to the `CrmContact` interface.
- Add `email` to the `.select(...)` query that fetches contacts for the selected customer.
- Store the selected contact's email in a new state variable (e.g., `contactEmail`).
- In `applyContact`, set `contactEmail` from `contact.email`.
- Pass `contactEmail` to the `LetterBuilder` component via `letterData`.
- Reset `contactEmail` when the form is cleared.

### 2. Pass contact email through to email navigation
**File: `src/components/LetterBuilder.tsx`**
- Add `contactEmail?: string` to the `LetterBuilderProps` `letterData` interface.
- In the email button's `navigate('/email', { state: ... })` call, add `to: letterData.contactEmail` inside the `prefill` object.

### 3. Consume the `to` field in EmailPage and EmailCompose
**File: `src/pages/EmailPage.tsx`**
- Pass `prefillData?.to` as a new `initialTo` prop to `EmailCompose`.

**File: `src/components/email/EmailCompose.tsx`**
- Add `initialTo?: string` to the `EmailComposeProps` interface.
- In the `useEffect` that runs on open (for `mode === 'new'`), set `setTo(initialTo || '')` so the To field is pre-filled but editable.

This way, when a user clicks "Email Letter", the contact's email from the CRM is automatically placed in the recipient field. The user can still edit it before sending.

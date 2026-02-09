

# Use User's Email as From Address and Filter Inbox

## Overview

Update the email system so each user sends from their own email identity and only sees inbox emails addressed to them.

## Changes

### 1. EmailPage.tsx
- Extract `user.email` from the session and store it in state
- Pass `userEmail` prop to `EmailCompose`, `EmailList`, and `EmailQuickAdd`

### 2. EmailCompose.tsx
- Add `userEmail: string` to the props interface
- Display `userEmail` in the disabled "From" input instead of `noreply@send.adrianidea.ir`
- Pass `from_email: userEmail` in the `send-email` edge function call
- Use `userEmail` as `from_email` when saving drafts

### 3. EmailList.tsx
- Add `userEmail: string` to the props interface
- In the inbox folder filter, add `.eq('to_email', userEmail)` so only emails addressed to the user appear
- Other folder filters remain unchanged (they already use `user_id`)

### 4. EmailQuickAdd.tsx
- Add `userEmail: string` to the props interface
- Replace the hardcoded `'m.barkhordari@adrianidea.ir'` with the `userEmail` prop

### 5. send-email Edge Function
- Accept `from_email` in the request body
- Look up the user's email from the profiles table as a fallback if `from_email` is not provided
- Add `reply_to: [userEmail]` to the Resend API call so replies go to the user
- Store the user's real email as `from_email` in the emails table insert (instead of `noreply@send.adrianidea.ir`)
- Keep the Resend "from" field as `noreply@send.adrianidea.ir` (required by domain verification)

### 6. receive-email Edge Function
- No changes needed

## Technical Note

Resend only allows sending from verified domains, so the SMTP sender remains `noreply@send.adrianidea.ir`. The `reply_to` header ensures replies reach the user's real mailbox, and the stored `from_email` shows the user's identity in the UI.


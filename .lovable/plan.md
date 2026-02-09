

# Use User's Authenticated Email as Resend "From" Address

## What's Changing

Currently the Resend API sends from `noreply@send.adrianidea.ir` with the user's email only in the `reply_to` header. Since `adrianidea.ir` is a verified domain in Resend, the actual "from" address can be the user's real `@adrianidea.ir` email from their authentication account.

## Change

### `supabase/functions/send-email/index.ts`

Update the Resend API call to use the user's authenticated email directly as the sender:

**Before (line 72):**
```
from: `${senderName} <noreply@send.adrianidea.ir>`,
```

**After:**
```
from: `${senderName} <${userEmail}>`,
```

The `reply_to` field can also be removed since the "from" address itself will now be the user's real email -- replies will go directly to them.

No other files need to change. The frontend already displays `userEmail` (from `session.user.email`) in the compose "From" field, and the database already stores it as `from_email`.

## Summary

| File | Change |
|------|--------|
| `supabase/functions/send-email/index.ts` | Use user's auth email in Resend `from` field instead of `noreply@send.adrianidea.ir` |


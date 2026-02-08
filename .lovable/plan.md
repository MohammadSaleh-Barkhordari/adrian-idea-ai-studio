

# Fix Push Notification Edge Function — Implement Proper Web Push Protocol

## Problem

The current `send-push-notification` edge function (lines 135-142) sends raw unencrypted JSON via `fetch()`:

```typescript
const response = await fetch(pushEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'TTL': '86400',
  },
  body: notificationPayload  // ❌ Not encrypted, no VAPID auth!
});
```

Web Push Protocol (RFC 8291/8292) requires:
- ECDH encrypted payload
- VAPID signed JWT for authentication
- Proper headers: `Authorization`, `Content-Encoding: aes128gcm`

Apple and Google push services reject these malformed requests — notifications silently fail.

## Solution

Use the `@negrel/webpush` Deno library which handles all encryption, signing, and headers automatically.

---

## Implementation

### 1. Rewrite `supabase/functions/send-push-notification/index.ts`

Complete replacement using proper Web Push Protocol:
- Import `jsr:@negrel/webpush` library
- Cache VAPID keys after first import for performance
- Use `webpush.sendPushMessage()` for encrypted/signed delivery
- Keep notification preferences filtering
- Auto-cleanup expired subscriptions (410 Gone)

### 2. Create `supabase/functions/test-push-notification/index.ts`

New test function for debugging without auth:
- Accepts `user_id` parameter
- Sends test notification to all user's subscriptions
- No JWT verification (testing only)

### 3. Update `supabase/config.toml`

Add test function configuration:
```toml
[functions.test-push-notification]
verify_jwt = false
```

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `supabase/functions/send-push-notification/index.ts` | Replace entirely |
| `supabase/functions/test-push-notification/index.ts` | Create new |
| `supabase/config.toml` | Add test function entry |

---

## Database Schema ✓

Already correct:
- `id` (uuid)
- `user_id` (uuid)
- `endpoint` (text)
- `p256dh` (text)
- `auth` (text)
- `created_at` (timestamptz)

---

## After Deployment

1. Clear old service workers on your phone
2. Re-subscribe to push notifications (old subscriptions may be invalidated)
3. Test with the new test-push-notification function




# Update VAPID Keys for Push Notifications

## Overview

Update the VAPID key pair across both frontend and backend to enable push notifications on mobile devices.

## Changes Required

### 1. Update Frontend Environment Variable

**File:** `.env`

Update the VAPID public key from the old value to the new one:

```
VITE_VAPID_PUBLIC_KEY="BFsWMv1qi_UV3aWL-FROEJDmMMvGYpeox9z-9s8VS0lbgjRQVNGM6G_qAwufLaLCxEYUlDW6e_BB4YICpOlz1lM"
```

### 2. Update Backend Secrets

Update two secrets in the backend:

| Secret Name | New Value |
|-------------|-----------|
| `VAPID_PUBLIC_KEY` | `BFsWMv1qi_UV3aWL-FROEJDmMMvGYpeox9z-9s8VS0lbgjRQVNGM6G_qAwufLaLCxEYUlDW6e_BB4YICpOlz1lM` |
| `VAPID_PRIVATE_KEY` | `83nAS5ymKauVJzBLQOJpD8pmJXg_jBJ8Gwe2xmcpM8E` |

## Important Notes

- After updating these keys, any existing push subscriptions from users will become invalid
- Users will need to re-enable notifications after this change
- The private key should be kept secure and not shared publicly

## Files to Modify

| Item | Type | Action |
|------|------|--------|
| `.env` | File | Update `VITE_VAPID_PUBLIC_KEY` |
| `VAPID_PUBLIC_KEY` | Secret | Update value |
| `VAPID_PRIVATE_KEY` | Secret | Update value |


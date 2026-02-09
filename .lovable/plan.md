
# Add Forgot Password / Reset Password Flow

## Overview

Add a complete password reset flow to the auth page with two parts:
1. A "Forgot Password?" link on the Sign In tab that shows a reset form
2. A new `/reset-password` route where users land after clicking the email link to set a new password

## How It Works

1. User clicks "Forgot Password?" on the Sign In tab
2. A view appears asking for their email
3. They submit and receive a password reset email via `supabase.auth.resetPasswordForEmail()`
4. The email contains a link back to `/reset-password`
5. On that page, the user enters a new password and it's saved via `supabase.auth.updateUser()`

---

## Files to Modify/Create

### 1. `src/pages/AuthPage.tsx`
- Add a `forgotPassword` state toggle
- When active, show only an email field + "Send Reset Link" button instead of the sign-in form
- Add a "Back to Sign In" link
- Add a "Forgot Password?" button below the Sign In button
- Use `supabase.auth.resetPasswordForEmail({ email, options: { redirectTo: window.location.origin + '/reset-password' } })`

### 2. `src/pages/ResetPasswordPage.tsx` (NEW)
- Simple page with Navigation + Footer
- Two password fields (new password + confirm)
- On submit, call `supabase.auth.updateUser({ password })`
- On success, redirect to `/dashboard`
- Listen for `PASSWORD_RECOVERY` auth event to confirm the token is valid

### 3. `src/App.tsx`
- Add lazy import for `ResetPasswordPage`
- Add route: `<Route path="/reset-password" element={<ResetPasswordPage />} />`

---

## Technical Details

### Forgot Password (AuthPage)

```typescript
const handleForgotPassword = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  // Show success toast: "Check your email for a reset link"
};
```

### Reset Password Page

```typescript
// Listen for the PASSWORD_RECOVERY event
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    setCanReset(true);
  }
});

const handleReset = async () => {
  if (newPassword !== confirmPassword) { /* show error */ return; }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (!error) navigate('/dashboard');
};
```

---

## UI Flow

```text
Sign In Tab
  [Email field]
  [Password field]
  [Sign In button]
  [Forgot Password? link]  <-- NEW

  Click "Forgot Password?" -->

  [Email field]
  [Send Reset Link button]
  [Back to Sign In link]

  User gets email --> clicks link --> /reset-password

  [New Password field]
  [Confirm Password field]
  [Reset Password button]
```

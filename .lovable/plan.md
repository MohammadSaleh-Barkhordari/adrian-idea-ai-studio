

# Enhanced Notifications for Our Life Pages

## Overview

Implement comprehensive push notifications for the two users (Raiana and Mohammad) whenever **any change** occurs in the Our Life section:

| Table | CREATE | UPDATE | DELETE |
|-------|--------|--------|--------|
| `our_calendar` | Currently partial (only new) | Missing | Missing |
| `our_financial` | Missing | Missing | Missing |
| `our_todos` | Missing | Missing | Missing |

**Target Users:**
- `19db583e-1e4a-4a20-9f3c-591cb2ca3dc7` (Mohammad)
- `8dd0bb2f-2768-4c1c-9e62-495f36b882d4` (Raiana)

When one person makes a change, the **other person** receives a notification.

---

## Notification Types by Action

### Our Calendar (`our_calendar`)

| Action | Title | Body Example | URL |
|--------|-------|--------------|-----|
| CREATE | 📅 New Event Added | Mohammad added "Dentist" on Feb 10 at 2:00 PM | `/our-calendar` |
| UPDATE | 📅 Event Updated | Mohammad updated "Dentist" to 3:00 PM | `/our-calendar` |
| DELETE | 📅 Event Removed | Mohammad removed "Dentist" from Feb 10 | `/our-calendar` |

### Our Financial (`our_financial`)

| Action | Title | Body Example | URL |
|--------|-------|--------------|-----|
| CREATE | 💰 New Transaction | Mohammad added: Groceries - $45.00 (expense) | `/our-financial` |
| UPDATE | 💰 Transaction Updated | Mohammad updated: Groceries to $50.00 | `/our-financial` |
| DELETE | 💰 Transaction Removed | Mohammad removed: Groceries - $45.00 | `/our-financial` |

### Our Todos (`our_todos`)

| Action | Title | Body Example | URL |
|--------|-------|--------------|-----|
| CREATE | ✅ New Task Added | Mohammad added: "Buy milk" (high priority) | `/our-todo` |
| UPDATE | ✅ Task Updated | Mohammad marked "Buy milk" as completed | `/our-todo` |
| DELETE | ✅ Task Removed | Mohammad removed: "Buy milk" | `/our-todo` |

---

## Implementation Strategy

Rather than using database triggers (which would require Edge Functions on every database change), we will integrate notifications directly in the frontend components where CRUD operations happen. This approach:

- Gives us access to user context (who made the change)
- Allows richer notification messages
- Uses the existing `sendNotification` helper

---

## Files to Modify

### 1. `src/lib/notifications.ts`
Add a helper function to get the "other person's" user ID for Our Life notifications:

```typescript
// The two Our Life users
const OUR_LIFE_USERS = {
  mohammad: '19db583e-1e4a-4a20-9f3c-591cb2ca3dc7',
  raiana: '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'
};

export function getOtherOurLifeUser(currentUserId: string): string | null {
  if (currentUserId === OUR_LIFE_USERS.mohammad) return OUR_LIFE_USERS.raiana;
  if (currentUserId === OUR_LIFE_USERS.raiana) return OUR_LIFE_USERS.mohammad;
  return null;
}

export function getOurLifeUserName(userId: string): string {
  if (userId === OUR_LIFE_USERS.mohammad) return 'Mohammad';
  if (userId === OUR_LIFE_USERS.raiana) return 'Raiana';
  return 'Someone';
}
```

### 2. `src/pages/OurFinancialPage.tsx`
Add notifications for:
- **Create**: After `saveFinancialRecord()` succeeds
- **Delete**: After `handleDelete()` succeeds

### 3. `src/pages/OurTodoPage.tsx`
Add notifications for:
- **Toggle status**: After `toggleTodoStatus()` succeeds
- **Delete**: After `deleteTodo()` succeeds

### 4. `src/components/NewTodoDialog.tsx`
Add notification for:
- **Create**: After new todo is inserted successfully

### 5. `src/components/EventDialog.tsx`
Enhance existing notification to also cover:
- **Update**: When editing an existing event
- **Delete is handled in TimeSlotView.tsx**

### 6. `src/components/TimeSlotView.tsx`
Add notification for:
- **Delete**: After `handleDeleteEvent()` succeeds

---

## Technical Implementation

Each component will follow this pattern:

```typescript
import { sendNotification, getOtherOurLifeUser, getOurLifeUserName } from '@/lib/notifications';

// After successful operation
const otherUserId = getOtherOurLifeUser(user.id);
if (otherUserId) {
  const actorName = getOurLifeUserName(user.id);
  await sendNotification(
    '💰 New Transaction',
    `${actorName} added: ${paymentFor} - ${currency} ${amount}`,
    [otherUserId],
    'financial',
    '/our-financial'
  );
}
```

---

## Notification Frequency Note

Since these users want to be notified of **all changes**, notifications will be sent for every single CRUD operation. This ensures both partners stay synchronized on:
- Financial transactions (who paid, for what, how much)
- Calendar events (schedules, appointments)
- Todo items (tasks, completions)

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/lib/notifications.ts` | Add `getOtherOurLifeUser()` and `getOurLifeUserName()` helpers |
| `src/pages/OurFinancialPage.tsx` | Add notifications on create and delete |
| `src/pages/OurTodoPage.tsx` | Add notifications on toggle and delete |
| `src/components/NewTodoDialog.tsx` | Add notification on create |
| `src/components/EventDialog.tsx` | Add notification on update (create already exists) |
| `src/components/TimeSlotView.tsx` | Add notification on delete |




# Email Dashboard for adrianidea.ir

## Prerequisites: Two Secrets Needed

Before building, two secrets must be added:

1. **RESEND_API_KEY** -- your Resend API key (you said you have this ready)
2. **WEBHOOK_SECRET** -- a random string for securing the inbound email webhook. You can generate one by visiting [RandomKeygen](https://randomkeygen.com/) and copying a "Fort Knox Password", or just type any long random string (e.g., `wh_a8f3k29xp5m7q2z`)

I will prompt you to enter both secrets at the start of implementation.

---

## Step 1: Database Migration

Create 3 tables via SQL migration:

**`emails`** -- stores all sent and received emails with fields for threading (`in_reply_to`), folder states (`is_read`, `is_starred`, `is_archived`, `is_deleted`), Resend tracking (`resend_id`), and direction (`inbound`/`outbound`).

**`email_attachments`** -- file metadata linked to emails with cascade delete.

**`email_contacts`** -- auto-saved address book per user with unique constraint on (user_id, email).

All tables get RLS policies restricting access to the owning user. A composite index ensures fast folder queries. Realtime is enabled on the emails table.

A private storage bucket `email-attachments` is also created.

---

## Step 2: Edge Functions

### `send-email` (JWT required)
- Receives `{ to, to_name, subject, body_html, body_text, from_name, reply_to_id }`
- Authenticates the user via the Authorization header
- Calls Resend API at `https://api.resend.com/emails`
- Sender: `${from_name || 'Adrian Idea'} <noreply@send.adrianidea.ir>`
- Inserts the sent email into the `emails` table
- Auto-saves recipient to `email_contacts`

### `receive-email` (public webhook, no JWT)
- Receives `{ from_email, from_name, to_email, subject, body_text, body_html, secret }`
- Verifies the `secret` field matches `WEBHOOK_SECRET`
- Inserts an inbound email record
- Looks up user by matching `to_email` against the profiles table

---

## Step 3: UI Components

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/EmailPage.tsx` | Main email client with 3-panel responsive layout |
| `src/components/email/EmailSidebar.tsx` | Folder nav (Inbox, Sent, Drafts, Starred, Archive, Trash) with unread badges |
| `src/components/email/EmailList.tsx` | Paginated email list with search, bulk actions, realtime updates |
| `src/components/email/EmailDetail.tsx` | Full email view with reply/forward/archive/delete, thread display, DOMPurify sanitization |
| `src/components/email/EmailCompose.tsx` | Compose dialog with To autocomplete, reply/forward pre-fill, draft saving |
| `src/components/email/EmailQuickAdd.tsx` | Dialog to manually log an inbound email for testing |

### Layout
- **Desktop (lg+)**: 3 columns -- sidebar (240px) | email list (380px) | detail (1fr)
- **Tablet (md)**: Sidebar collapses to 60px icon-only | list + detail
- **Mobile**: Single panel with back navigation between list and detail

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/email` route |
| `src/pages/DashboardPage.tsx` | Add "Email" card with Mail icon and unread count badge |
| `supabase/config.toml` | Add `send-email` (verify_jwt=false, auth checked in code) and `receive-email` (verify_jwt=false) entries |

---

## Key Features

- **Folder navigation**: Inbox, Sent, Drafts, Starred, Archive, Trash with proper query filters
- **Compose**: New email, Reply (pre-fills To + "Re:" + quoted body), Forward (pre-fills "Fwd:" + body)
- **Draft saving**: Save compose state to database
- **Threading**: Follow `in_reply_to` chain to display conversation history
- **Search**: Filter by subject, sender, or body text
- **Bulk actions**: Select multiple emails to archive, delete, or toggle read status
- **Real-time**: Supabase realtime subscription for live inbox updates + toast notifications
- **Auto-contacts**: Recipients are automatically saved for future autocomplete
- **Quick Add**: Manually log emails received via DirectAdmin webmail

---

## Implementation Order

1. Prompt for RESEND_API_KEY and WEBHOOK_SECRET secrets
2. Run database migration (tables + RLS + index + realtime + storage)
3. Create both edge functions
4. Build all 6 UI component files
5. Update App.tsx route and DashboardPage.tsx card
6. Test send flow end-to-end


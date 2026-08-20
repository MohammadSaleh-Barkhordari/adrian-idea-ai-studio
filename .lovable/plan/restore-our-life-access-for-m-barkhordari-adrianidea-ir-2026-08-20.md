# Restore Our Life access for m.barkhordari@adrianidea.ir

## What the checks show

Your account (`m.barkhordari@adrianidea.ir`) is **already allowed** everywhere it matters:

- It is in the allowed-email list on the Our Life, Our Financial, Our Calendar and To Do pages.
- It is in the dashboard card's special-access list.
- The financial records policies already include your user ID.
- The account signed in successfully today.

So this is not a permissions problem — it is a **navigation problem**. The marketing homepage no longer has any sign-in entry point (it was removed earlier when the new design shipped), so there is no visible path to the dashboard where the Our Life card lives.

One real gap did show up: Our Calendar and To Do are still **per-user private** (each account sees only its own rows), while you asked for the same shared data as Our Financial.

## Changes

### 1. Re-add a discreet sign-in entry point
- Small "Sign in" text link in the site footer (not the hero CTA area), pointing to `/auth`.
- Internal routes stay `noindex` and remain disallowed in robots.txt.

### 2. Make Our Calendar and To Do shared, like Our Financial
- Update the row-level policies on the calendar and to-do tables so both Our Life accounts can view, add, edit and delete all records, matching how Our Financial already behaves.
- Each row keeps its author, so it stays clear who created what.

### 3. Make the access list maintainable
- Replace the email strings copied across five files with one shared constant, so future changes happen in one place.
- No change to who has access today (the same two accounts).

## Technical notes

- Migration replaces `user_id = auth.uid()` policies on `our_calendar` and `our_todos` with the same two-UUID array predicate used by `our_financial`, keeping grants intact.
- New `src/lib/ourLifeAccess.ts` exports the allowed emails plus a helper; `OurLifePage`, `OurFinancialPage`, `OurCalendarPage`, `OurTodoPage` and `DashboardPage` import it.
- Footer link added in `src/components/home/shared.tsx` footer, styled with the existing muted link class.

## Out of scope
- Any visual redesign of the marketing pages.
- Adding a third Our Life member.

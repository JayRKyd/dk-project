## Admin & Client Feedback Implementation Plan

### 1) Admin dashboard: deep links to user dashboards/settings/profiles

Goal: From Admin → User Management, let superusers quickly open a Lady/Club/Client’s profile page, public profile, and read-only dashboard/settings summaries.

Scope:
- Add clickable names/avatars to route to:
  - Lady public profile: `/ladies/:id` (or slug)
  - Club public profile: `/clubs/:id`
  - Client details drawer (already exists) → extend with dashboard quick links
- Add read-only “snapshot” panels inside admin drawer: basic info, verification status, credits summary, recent activity

Deliverables:
- Update `adminUserService.getUsers` to include `profile_id`, `club_id`, `lady_profile_id` where missing
- In `src/pages/admin/UserManagement.tsx`, make row name clickable with role-based target
- Add a right drawer tabs: Overview, Profile, Credits, Activity (read-only)

Acceptance criteria:
- Clicking a Lady/Club opens correct destination
- Links respect suspension/verification guards
- No sensitive actions in read-only views; admin still has separate moderation tools

Risks:
- Slug vs id routing mismatches → fallback resolution implemented

---

### 2) Admin account recovery + MFA enforcement

Goal: Ensure administrators can always regain access and reduce account-takeover risk.

Plan:
- Enforce MFA for `role = 'admin'` (TOTP preferred)
- Create break-glass owner account with hardware key stored offline
- Add runbook and admin-only endpoint/SQL function to:
  - Reset password for a specified admin user (with ownership checks, audit logging)
  - Revoke sessions for compromised accounts
- Enable email change protection and sign-in alerts

Deliverables:
- Migration: audit table `admin_security_events`
- Edge function or RPC: `admin_reset_user_password(target_user_id)` with RLS bypass via SECURITY DEFINER
- Documentation: recovery steps and hardware key custody

Acceptance criteria:
- Password reset and session revoke tested end-to-end
- MFA enforced for all current admins

Risks:
- SECURITY DEFINER misuse → strict argument validation, row-level checks, and audit logs

---

### 3) Club → Ladies: approval flow completion + audit trail

Goal: Complete pending → active workflow and record timestamps.

Plan:
- Ensure `club_ladies` has: `status`, `join_date`, `approved_at`, `left_at`
- UI:
  - Club can invite/link existing Lady → status `pending`
  - Lady can Approve/Decline in Lady dashboard → sets `approved_at` or deletes/marks left
  - Club Ladies tab shows timeline (joined, approved, left) with dates
- RLS: Allow insert by club on own club, allow status update by lady on own linkage; read for both parties, hide pending from public

Deliverables:
- Service methods finalized: `addLadyToClub`, `approveLadyInvite`, `declineLadyInvite`, `ladyLeaveClub`
- Club UI: audit timeline component

Acceptance criteria:
- Pending not visible on public club page
- Approve/Decline updates timeline correctly

---

### 4) Persist form drafts; avoid losing data on window/tab switch

Goal: Prevent accidental data loss on navigation or reloads.

Plan:
- Use localStorage-backed form state for settings forms (club, lady)
- Debounced autosave to localStorage; clear on successful submit
- Prompt before unload when dirty

Deliverables:
- Small `useFormPersistence(key, state)` hook
- Integrations: Club Settings, Lady Settings, Promo forms

Acceptance criteria:
- Switching tabs/windows retains inputs
- Submitting clears drafts

---

### 5) Gift system (Client → Lady)

Goal: Enable clients to purchase and send gifts to ladies using credits.

Plan:
- DB: `gifts`, `gift_transactions`, optional `gift_catalog`
- RLS: client can create gift transactions for themselves; lady can read gifts addressed to her; admin full read
- Services: `giftService` (browse, send, history), credit integration (atomic spend via RPC)
- UI: Lady gift list and notifications; Client purchase flow with confirmation

Deliverables:
- Migration for tables and indexes
- RPC: `send_gift(client_id, lady_id, gift_id, note)` deducts credits and records gift
- Pages/components: Client gift modal, Lady gifts tab

Acceptance criteria:
- Credits deducted atomically; gift appears for lady; notifications sent

Risks:
- Double-spend/race conditions → single RPC with transaction

---

### 6) Client reviews for ladies

Goal: Allow clients to write reviews about ladies without booking requirement, no anonymous option.

Plan:
- Ensure `WriteReview` accepts lady target and stores under `reviews` table with `target_type = 'lady'`
- RLS: clients can insert, ladies/clubs read aggregated; admin moderation path
- UI: enable CTA from lady public page; prevent duplicate review per author/target (per period)

Deliverables:
- Service: `clientDashboardService.submitReview(ladyId, data)` finalized
- Route: `/write-review/:ladyId` wired; remove conflicting club route collision

Acceptance criteria:
- Review appears on lady profile and in dashboards; moderation hooks intact

---

### Timeline & Dependencies

Order of execution:
1. Admin deep links/read-only views
2. Club→Ladies approval audit trail + RLS
3. Form persistence
4. Client Reviews
5. Gift system
6. Admin recovery + MFA

Where needed, add migrations with SECURITY DEFINER functions and RLS tests.


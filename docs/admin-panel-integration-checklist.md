## Admin Panel Integration Checklist

This checklist captures the data flows, tables, policies, and UI hooks required for a fully functional admin panel. Use it to verify production readiness and as a guide when wiring new features.

### 1) Authentication, Roles, and Access
- Ensure `users.role ∈ {admin, lady, club, client}` is set at signup or migrated from auth metadata.
- Guard admin routes with `AdminGuard` and `ProtectedRoute requiredRole="admin"`.
- Confirm admin JWT/session reaches the browser (no anonymous access to admin pages).

### 2) Global Block/Suspension
- Tables/Columns: `public.users.is_blocked` (boolean), `auth.users.banned_until` (timestamp).
- Functions (created):
  - `public.is_current_user_admin()`
  - `public.admin_block_user(p_user_id uuid)`
  - `public.admin_unblock_user(p_user_id uuid)`
- UI: `/admin/users` → Suspend/Unsuspend buttons call RPCs via `adminUserService`.
- Result: Suspended user cannot log in; also flagged in `users.is_blocked`.

### 3) Verification Workflows (Lady/Club/Client)
- Tables: `lady_verification_documents`, `club_verification_documents`, `client_verification_documents` (+ `role` columns), `users` verification fields.
- Storage: `verification-documents` bucket, RLS requires keys to begin with `auth.uid()`.
- Guards: `VerificationGuard`, `ClubVerificationGuard` (no bypass), client guard.
- Admin UI: `VerificationQueue`, `VerificationDetails`, actions in `adminVerificationService` (`approveClubDocument`, `approveClubUser`, etc.).
- Confirm RLS for document tables: insert/select/update/delete by owner; admin policy available.

### 4) Media Moderation
- Storage buckets used by end users: `profile-pictures`, `gallery-images` (ensure RLS by user folder: `${auth.uid()}/...`).
- Table: `media_items` (id, user_id, media_type, url, status, moderation_status, created_at…)
- Client hook (implemented): after gallery upload in `LadySettings`, call `ContentModerationService.recordUploadedImages()` to insert rows with `moderation_status='pending'`.
- Admin UI: `/admin/media` shows a summary table: per-user counts + “View latest” to load a small preview set for a user.
- Moderation actions: approve/reject/hide/delete via `moderate_content` RPC.

### 5) Comments and Reviews Moderation
- Tables: `comments` (content across photo/fan_post/gift/review), `reviews` (author_id, content, ratings…).
- Admin UI: `/admin/comments` shows per-user totals (comments + reviews) with drilldown (recent comments list). Optionally add “View reviews” drilldown.
- Moderation actions for comments via `moderate_content` RPC; for reviews via `advancedReviewService.moderateReview`.

### 6) User Management
- Page: `/admin/users` (search + pagination; role, tier, DLT/Client #, status badges, actions).
- Services: `adminUserService.getUsers({ page, pageSize, search })` with `client_number` included.
- Actions:
  - Suspend/Unsuspend → RPCs described in section 2.
  - Optional: add “Delete account” (requires Edge Function with service role).

### 7) Analytics (Live)
- Sources queried by `analyticsService`:
  - `users` (totals, by role, verified, recent activity)
  - `profiles`, `bookings`, `reviews`, `fan_posts`, `gifts`
- Ensure “Locked Users” uses `is_blocked` (already updated).
- Run periodic checks to ensure counts reflect RLS and indexes exist on queried columns.

### 8) Financial Dashboard
- Tables required:
  - `transactions` (id, user_id, transaction_type, amount, credits_amount, status, payment_provider, metadata, created_at)
  - `revenue` (id, transaction_id, revenue_type, amount, created_at)
  - `payouts` (id, user_id, amount, status, payout_method, payout_details, created_at, processed_at)
- Credit system integration points:
  - On credit purchase: insert `transactions` (type: `credit_purchase`, status), and `revenue` (platform fees) if applicable.
  - On credit spend (gifts, bumps, bookings): insert `transactions` (type: `credit_usage`) with credits/amount details.
  - On payout run: insert/update `payouts` rows and mark status transitions.
- Admin UI: `/admin/financial` pulls revenue stats for date range + recent transactions and payouts.

### 9) Storage & RLS Policies
- Buckets:
  - `verification-documents` (public read as needed; per-user folder policies; admin read policy present).
  - `profile-pictures`, `gallery-images` (users can insert/read/update their own folder; optional public read for profile pictures).
- Validate policies on `storage.objects`:
  - User folder rule: `(storage.foldername(name))[1] = auth.uid()`
  - Admin override policy (via users table role check or dedicated view).

### 10) Environment Variables
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in the web app.
- If using Edge Functions for admin-only actions (delete user, payouts), configure service role key in the function environment (never expose to client).

### 11) Migrations & Indexes (Performance)
- Ensure indexes on frequent filters:
  - `users(role, is_blocked, is_verified, created_at)`
  - `media_items(user_id, moderation_status, created_at)`
  - `comments(user_id, moderation_status, created_at)`
  - `reviews(author_id, moderation_status, created_at)`
  - `transactions(user_id, transaction_type, status, created_at)`
  - `payouts(user_id, status, created_at)`

### 12) Routing & Navigation
- Admin pages registered in `src/App.tsx` under `/admin/*` and protected by `AdminGuard`.
- Back links added to detail pages (e.g., verification details) to improve review workflow.

### 13) QA & Monitoring
- Seed accounts: at least one admin, one lady, one club, one client.
- Smoke tests:
  - Upload lady gallery images → visible in `/admin/media` summary.
  - Submit club verification → visible in `/admin/verifications` and details show documents.
  - Post comments/reviews → counts appear in `/admin/comments`; drilldown lists items.
  - Suspend a user → login blocked; unsuspend → login allowed.
  - Credit purchase/usage (once wired) → `/admin/financial` shows new transactions; revenue reflects fees.

### 14) Optional Enhancements
- Add review drilldown to `/admin/comments` (author’s reviews list).
- Export CSV for transactions/payouts.
- Admin notifications for verification submissions and flagged media/comments.

---
Use this checklist during staging rollouts and after schema changes to ensure the admin panel remains operational end-to-end.

### Notes and Implementation Details
- Settings page behavior:
  - UI toggles in `/admin/settings` persist to `platform_settings.settings` via `adminSettingsService`.
  - Toggles do not enforce behavior automatically; consuming features must read and honor them. Example: review submission should check `requireReviewApproval` and set `moderation_status` accordingly.
- Reviews drilldown in `/admin/comments`:
  - The summary now aggregates both `comments` and `reviews` counts per user.
  - “View reviews” loads the author’s reviews (latest 20) and maps them into the existing list for quick inspection.
- Media tracking:
  - `uploadMultipleImages` records uploads into `media_items` (status=`active`, moderation_status=`pending`).
  - Any image flow not using `uploadMultipleImages`/`uploadImage` should call `ContentModerationService.recordUploadedImages(userId, uploads)` to appear in `/admin/media`.
  - Consider a uniqueness guard on `media_items (user_id, url)` to prevent duplicate inserts if multiple hooks call recording.


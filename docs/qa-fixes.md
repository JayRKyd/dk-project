## QA Fixes and Follow-ups

This document tracks issues raised during client testing and the agreed fixes. It will be updated as new feedback comes in.

### 1) Club sign-up/verification: phone number and website validation are too strict

- **Current behavior**
  - Phone field accepts only North-American (US-style) formats; European formats (e.g., `+31 6 11 222 333`, `0031 6 11 222 333`, `0611222333`) are rejected.
  - Website field appears to only accept `.com` domains and rejects valid non-.com TLDs (e.g., `.nl`, `.de`, `.co.uk`).

- **Expected behavior**
  - Phone: Accept international numbers in common European formats and E.164 format. Examples that must pass:
    - `+31 6 11 222 333`
    - `0031 6 11 222 333`
    - `0611222333` (local Dutch mobile format)
    - `+44 20 7123 4567`
  - Website: Accept valid URLs for any TLD, not just `.com`. Examples that must pass:
    - `https://www.relaxclub.nl`
    - `www.relaxclub.nl`
    - `relaxclub.nl`
    - `https://club.example.de`

- **Acceptance criteria**
  - Entering the Dutch sample (`+31 6 11 222 333` or `0031 6 11 222 333`) no longer shows a validation error; form can be saved.
  - Entering `www.relaxclub.nl` or `relaxclub.nl` (no protocol) is accepted and saved.
  - Validation errors still appear for clearly invalid input (e.g., alphabetic strings in phone; malformed URLs).
  - Server accepts and persists the submitted data without 4xx errors.

- **Implementation notes (proposed)**
  - Replace custom phone regex with a more permissive approach:
    - Prefer library-based parsing (e.g., `libphonenumber-js`) with region-agnostic E.164 support; sanitize input by removing spaces/dashes before validation.
    - Alternatively, use a lenient pattern that allows international prefixes (`+` or `00`), digits, spaces, and dashes; then normalize before save.
  - Relax URL validation to allow any public suffix (any TLD). Options:
    - Use `URL` constructor when the value includes a protocol; otherwise, prepend `https://` for validation only.
    - Accept bare domains with any TLD; store canonicalized form (e.g., ensure protocol is saved as `https://...`).
  - Keep existing UI hints but update helper text to indicate international formats and any-TLD support.

- **Testing**
  - Unit: validation passes for listed examples and fails for obviously invalid input.
  - E2E: complete the club verification form with the Dutch phone and `.nl` website and successfully save.

---

Add additional items below as more feedback is reported.

### 3) Admin → User Management: No direct link to user profile

- **Current behavior**
  - In the Users table, clicking the name/email does nothing; only Suspend/Unsuspend actions are available from the row.

- **Expected behavior**
  - The user cell provides a link to view the corresponding profile:
    - Lady: open public advertisement page (`/ladies/:id`)
    - Club: open public club page (`/clubs/:id`)
    - Client: open a lightweight profile view (basic info), or disable link if no public profile; alternatively open an admin-side user details drawer.
  - Optionally provide a “View details” action to open an admin drawer with key fields and quick links.

- **Acceptance criteria**
  - Each row’s user name/avatar is clickable when a public profile exists and opens in a new tab.
  - For clients (no public page), a details drawer/modal is available with user info and recent activity.
  - Suspend/Unsuspend actions continue to work and do not interfere with the link.

- **Implementation notes (proposed)**
  - Extend the table’s user cell to render a `<Link>` with the correct route based on `role` and `profileId`/`clubId`.
  - Add a fallback “View details” drawer for roles without public pages; include email, role, membership tier, verification status, credits, and timestamps.
  - Ensure `is_blocked` users’ public pages show “Unavailable” if opened from the link.

### 2) Admin → Verification Queue: Missing club contact details and attachments

- **Current behavior**
  - Admin queue items for clubs do not display key business contact fields (e.g., business phone, business website). This prevents manual verification by phone/email.
  - The row shows low/high priority and status icons but no quick access to submitted info. Attachments/document counts are unclear or missing.

- **Expected behavior**
  - For each club submission in the queue, show at-a-glance:
    - Club name
    - Business phone (click-to-call/tap via `tel:` and quick copy)
    - Business email (if present; `mailto:` link and quick copy)
    - Business website (clickable; opens in new tab)
    - Submission timestamp and submitter
    - For ladies, show document count and a link to view each; for clubs (simplified flow), show “Business info only (no documents required)” or any optional files if present
  - A details drawer/modal provides full submission info (all fields) and moderation actions (approve/reject, notes).

- **Acceptance criteria**
  - Queue list renders phone, email (if available), and website for clubs; all links are usable (tel/mailto/http) and values can be copied.
  - Clicking the club row opens details with all fields submitted during verification.
  - For ladies, details show uploaded documents with thumbnails/download links; for clubs, a clear label indicates no documents are required.
  - Approve/Reject actions remain functional and persist reviewer notes.

- **Implementation notes (proposed)**
  - Ensure admin queue query includes club business fields (e.g., `users.business_phone`, `users.business_website`, or from `clubs` table if stored there).
  - Normalize website display (prepend `https://` for display if protocol missing) and phone (format for display while keeping raw value for `tel:`).
  - Add a “Details” drawer/modal with a structured summary and action buttons.
  - Document count logic: show number of files where applicable; for clubs, render a message per simplified policy.

### 4) Reviews: remove booking requirement and anonymous posting (Phase 1)

- **Current behavior**
  - Users can only submit a review if they have a completed booking with the lady/club. There is also a “Post anonymously” option.

- **Expected behavior (Phase 1)**
  - Allow clients to submit reviews regardless of booking history.
  - Remove the “Post anonymously” option; reviews show the client’s name/username.
  - Keep admin moderation in place so offensive reviews can be removed.

- **Acceptance criteria**
  - The “must have booked” banner no longer blocks submission.
  - The anonymous checkbox is removed from the UI and not accepted by the API.
  - Successful submissions appear immediately and are visible publicly (subject to moderation if needed).

- **Implementation notes (proposed)**
  - Relax validation in `WriteReview` and `clientDashboardService.submitReview` to skip the booking check.
  - Remove anonymous flag from form and DB write path; display client identity on the review card.

### 5) Club page: WhatsApp CTA and Visit Options

- **Current behavior**
  - WhatsApp icon is inactive. Visit Options on the public card are static and not configurable per club.

- **Expected behavior**
  - WhatsApp: When a valid phone is present, render an active link to `https://wa.me/<E164>` (fallback to api.whatsapp.com) and open in new tab.
  - Visit Options: Add settings on the club side for two booleans: “Club visit” and “Escort visit”. Persist these and render dynamically on the public card.

- **Acceptance criteria**
  - Clicking WhatsApp opens a chat with the club’s number; hidden if no valid number.
  - Club owners can toggle one or both visit options in settings; public page shows only selected options.

- **Implementation notes (proposed)**
  - Normalize phone to E.164 before building WhatsApp link.
  - Add fields in `clubs` (or related settings) for visit options; wire to settings UI and public view.

### 6) Club photo uploads (logo/cover/gallery) fail intermittently

- **Current behavior**
  - Upload attempts for logo/cover return a generic “Failed to upload” message; image does not appear.

- **Expected behavior**
  - Support JPG/PNG/WebP up to reasonable size; on success, image displays immediately.
  - If failure, show clear reason (type/size/permission) and allow retry.
  - Record uploads in `media_items` for moderation as with other media.

- **Acceptance criteria**
  - Uploads succeed to the correct storage path with public URL, and the UI updates without reload.
  - Errors surface with actionable messages; retry works.

- **Implementation notes (proposed)**
  - Verify storage bucket/paths, RLS policy for clubs, and service integration; reuse lady upload pipeline (resize/watermark if applicable).
  - Add toast/inline error reporting based on caught error codes.

### 7) Club → Ladies: "Add Existing Lady" confirm does nothing (bug) and approval flow

- **Current behavior**
  - From Club Dashboard → Ladies → Add Lady, pressing Confirm sometimes does not create the link; no success message and the lady does not appear in the list. No notification is sent to the lady.

- **Expected behavior (bug fix)**
  - After Confirm, create a link record for the selected lady and show a success toast.
  - The lady appears in the club’s Ladies list immediately with a status shown (see approval flow below) and persists after reload.
  - If the action fails (permissions/duplicate/invalid user), an inline error message explains the reason.

- **Approval flow (enhancement)**
  - New statuses for `club_ladies`: `pending` → `active` → `left` (and possibly `removed`).
  - New lady notification (and optional email): when linked, the lady gets a notification in her dashboard and can Approve/Decline.
  - While `pending`, the lady is hidden from the public club page; after approve, status becomes `active` and she is shown publicly.
  - Lady dashboard control to Leave club at any time (sets status `left` and hides publicly).
  - Audit trail in the club’s Ladies tab (joined, approved, left) with timestamps.

- **Acceptance criteria**
  - Confirm reliably creates a link; success toast shown; list updates without reload.
  - Errors (duplicate link, invalid role/user, RLS) surface with clear messages.
  - Pending links are not rendered on the public club page; switching to active renders immediately.
  - Lady receives an in-app notification and can approve/decline; status updates accordingly.
  - Club can remove a link; lady can leave; both actions persist and update the UI.

- **Implementation notes (proposed)**
  - Ensure `clubService.addLadyToClub` inserts into `public.club_ladies` with an explicit `status` and returns the row; guard against duplicates.
  - Add notifications via `notifications` table for the lady; optional email integration later.
  - Add/verify RLS so that clubs can link only users with role `lady` and only to their own club; ladies can update their own link to `left`.
  - Add indexes on `(club_id, lady_id)` and on `status` for filtering; expose status in APIs and UI.


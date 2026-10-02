# Onboarding and friction improvement plan

Implement one item at a time, verify it, review its diff, and commit it before starting the next item. This document stays with the client repository because the workspace root is not a Git repository. Server changes receive separate commits when needed.

## Constraints

- Preserve authentication, invitation ownership, billing, renewal, and scoring rules.
- Use stored player handicaps directly. Never invent missing handicaps or convert them using course slope/rating.
- A partial roster means at least one valid player (and at least one valid team for team seasons); additional players can be added later.
- Preserve existing user changes. Initial server integration-test modifications belong to the user.
- Reuse course requests, drawers, form controls, and API operations. Avoid new dependencies.

## Sequence and acceptance criteria

1. **Preserve league drafts.** Resume from My Leagues; starting fresh requires an explicit action. Restore step, isolate users/renewals, handle blocked/corrupt storage, preserve checkout recovery.
2. **Mobile roster entry.** Stack fields on narrow screens; accessible edit/delete buttons; usable targets; retain readable table scrolling.
3. **Invitation sign-in context.** Keep safe invitation redirects across registration/sign-in; reject external redirects.
4. **Signup guidance.** Explain password length, show a dedicated verification-success state with resend/recovery, keep invitation registration intact.
5. **Course failures.** Explicit loading/error/empty states with retry in directory and event builders.
6. **Course check during league setup.** Search available courses or request one before roster work, without requiring a course on the league API or blocking setup while a request is pending.
7. **Event drafts and in-place course requests.** Persist single/series setup by user and league, restore safely, clear on successful creation, request courses without leaving the builder.
8. **Roster import and partial-roster guidance.** Paste spreadsheet rows or upload CSV/TSV; preview, validate required fields and numbers, detect duplicates, append with unique IDs; make clear more players can be added later. Native Excel files are not required; export as CSV or paste cells.
9. **Getting-started checklist.** Prioritize the first event, player invitations, and score entry; derive completion from actual league data; respect historical/read-only leagues.
10. **Simpler first-event setup.** Tournament defaults to single event; season retains recurring scheduling; progressively disclose scoring settings while preserving chosen values.
11. **Invitation management.** Explain missing emails, ready/pending/claimed states; select all; resend while preserving valid links, with delivery feedback; show all invitations; handle errors.
12. **Inline validation.** Show field errors and focus first invalid field in league/player/event setup; preserve existing domain validators and enforce required data.
13. **Score-draft clarity.** Explain device-local drafts and explicit submission; preserve storage-error messaging.
14. **Clipboard feedback.** Await copy; show success only when successful; explain fallback on failure.

## Verification for each commit

1. Inspect existing contracts and related tests; add meaningful regression coverage for changed behavior.
2. Run focused tests plus client typecheck and lint. Run server checks for server changes. Review the diff for data loss, permissions, invalid inputs, mobile layout, and async failures.
3. Exercise meaningful UI flows using browser tests; include narrow-screen checks and recovery cases. Run full verification and database-backed integration/end-to-end coverage at the end when the environment supports them. Record failures honestly; never claim an unrun check passed.

## Progress

- Implementing and verifying the sequence below.

### 1. League draft preservation — complete
- My Leagues resumes existing setup; explicit fresh-start confirmation preserves a draft when canceled.
- Restores wizard progress for the matching user/renewal; catches inaccessible storage.
- Verification: storage unit tests (2), browser resume/back/cancel regression, typecheck, lint, and diff whitespace check passed.
- Browser harness uses mocked APIs for deterministic UI coverage; backend integration coverage remains a separate gate.

### 2. Mobile roster entry — complete
- Responsive fields and labeled 44px edit/delete controls; table behavior preserved.
- Verification: desktop draft regression and 390px roster add/edit/delete browser test passed; typecheck, lint, diff check passed.

### 3. Invitation sign-in context — complete
- Registration/sign-in preserves invitation destinations; shared safe-path validation rejects external/backslash/control-character redirects.
- Verification: 7 return-path tests, 3 browser regressions, client/server typecheck and client lint passed. Two real-database backend tests passed for password/consent rejection and matching-email invitation registration, player role, verification destination, and unverified login rejection.

### 4. Signup guidance — complete
- Visible password-length guidance and a dedicated verification state with resend, sign-in, and different-email recovery; passwords cleared after registration.
- Verification: 4 browser regressions passed, including signup/resend/recovery; typecheck/lint/diff check passed. Backend password/consent and verification rules covered in step 3.

### 5. Course query states — complete
- Shared loading/error/empty messaging and retry in course directory and both event builders.
- Verification: 6 browser regressions passed, including failed request/retry and single/series failure states; typecheck/lint/diff check passed.

### 6. Course check during league setup — complete
- Search course/club/location and request a missing course in a lazy-loaded dialog before roster entry; setup can continue while requests are pending.
- Verification: 7 browser regressions passed including course selection, opening/closing requests, preserving form details, and continuing setup. Typecheck/lint/diff check passed; 11 backend course-request/upload tests passed after allowing local HTTP test sockets.

### Additional correction: deterministic default season dates
- Repeated browser checks exposed a pre-existing millisecond mismatch from independent start/end clock reads. The end date now derives from the exact same start Date.
- Verification: league/date/event unit tests (37), typecheck and lint passed; browser setup and mobile roster regressions passed after correction.

### 7. Event drafts and in-place course requests — complete
- Device drafts scoped/remounted by user and league; shared settings, builder choice, recurring schedule and lineups recover. Successful single/series creation clears all related drafts. Format/mode changes clear incompatible flights; mounting preserves restored flights.
- Course requests stay in a dialog; secondary-nine selections wait for course data before reconciliation.
- Verification: 9 browser regressions passed, then 2 focused draft/flight browser regressions passed after isolation review; 37 league/date/event tests, 7 draft tests, 13 related backend tests, typecheck/lint/diff check passed.

### 8. Roster import and partial roster guidance — complete
- Paste spreadsheet cells or upload CSV/TSV with preview; require valid names/gender/stored handicap (-10..54); reject duplicate names/emails and malformed/oversized inputs; append unique IDs. Partial rosters remain supported by existing league rules.
- Verification: 15 parser tests; browser preview/import/duplicate/ID regression; client typecheck/lint; 3 real database onboarding tests passed including partial-roster trial creation, rejected out-of-range handicap, and preserved negative handicap.
- Added an explicit backend onboarding-test typecheck because the existing server typecheck excludes test files; it passes. Corrected a new test's entitlement lookup before commit.

### 9. Getting-started checklist — complete
- Derived next action schedules the first playable event, finishes missing flights, or opens scoring. Invitations are optional. Guidance retires once scoring begins and is hidden for archived/unpaid leagues; intelligence appears once results exist.
- Verification: 3 progression tests, 2 dashboard browser tests including archived/payment-due restrictions, typecheck/lint/diff check passed.

### 10. Simpler first-event setup — complete
- Tournament/mixed leagues default to single events; fixed-hole seasons keep recurring setup; an explicit saved choice takes precedence.
- Creation pages progressively disclose points/allowances; required mode-specific rules remain visible. Existing edit-page disclosure remains unchanged.
- Verification: 14 builder/scoring tests, 3 browser regressions for defaults/disclosure/value persistence and event drafts, typecheck/lint/diff check passed.

### 11. Invitation management — complete
- Explain missing emails, select eligible players, expose all invitation states, and resend from the drawer. Keyboard dismissal restores focus.
- Backend serializes invitation changes; valid resends preserve links, expired links are replaced, and intentional emails receive distinct delivery keys.
- Verification: 3 frontend state tests, 2 email tests, browser selection/resend/keyboard regression, 4 real-database integration tests including concurrent resends, expiry and authorization; client/server/test typechecks, lint and whitespace checks passed.

### UI correction from user feedback — complete
- Replaced predefined design instructions in the workspace AGENTS.md with the user's compact existing-app direction; committed a reusable prompt in docs/UI_DESIGN_PROMPT.md.
- Reduced onboarding additions to a compact expandable course row and checklist; reused existing buttons, narrowed new dialogs/drawers, reduced nested card/copy density and invitation/import row spacing.
- Verification: 6 focused browser regressions passed. Desktop/mobile layout checks and screenshot inspection caught and corrected cramped mobile course content; final layout check passed. Typecheck/lint passed.

### 12. Inline validation — complete
- Persistent compact feedback identifies invalid league/event fields and restores focus; player fields show required/range errors, including keyboard focus for gender. Recurring setup validates each round using the shared event validator and exposes recovery feedback.
- Blank and out-of-range handicaps now fail frontend validation, matching backend rules. Edited numeric handicaps are normalized for the input without changing their stored value. Removed duplicate validation toasts.
- Verification: 32 validation tests, mobile add/edit-save/delete and league/single-event browser checks, recurring-generation recovery check, client typecheck/lint and backend test typecheck passed. Full backend integration suite passed 43 tests, including blank/null/range rejection and partial-roster creation.

### 13. Score-draft clarity — complete
- Compact status explains device-local saving and names the actual Submit Scores/Save Changes action needed to save to the league. Storage failures retain explicit recovery guidance across all five scoring forms.
- Verification: 13 draft/status/score-validation tests, typecheck, lint and whitespace check passed. Scoring API integration checks passed in the 43-test suite; full browser scoring regression remains the final gate.

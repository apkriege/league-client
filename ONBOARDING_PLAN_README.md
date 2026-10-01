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
11. **Invitation management.** Explain missing emails, ready/pending/claimed states; select all; resend via existing revoke/create operations with delivery feedback; show all invitations; handle errors.
12. **Inline validation.** Show field errors and focus first invalid field in league/player/event setup; preserve existing domain validators and enforce required data.
13. **Score-draft clarity.** Explain device-local drafts and explicit submission; preserve storage-error messaging.
14. **Clipboard feedback.** Await copy; show success only when successful; explain fallback on failure.

## Verification for each commit

1. Inspect existing contracts and related tests; add meaningful regression coverage for changed behavior.
2. Run focused tests plus client typecheck and lint. Run server checks for server changes. Review the diff for data loss, permissions, invalid inputs, mobile layout, and async failures.
3. Exercise meaningful UI flows using browser tests; include narrow-screen checks and recovery cases. Run full verification and database-backed integration/end-to-end coverage at the end when the environment supports them. Record failures honestly; never claim an unrun check passed.

## Progress

- Plan created; implementation pending.

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

# Client

## Required environment variables

Copy `.env.example` to `.env` and set:

- `VITE_API_URL`

Optional:

- Billing display overrides (`VITE_BILLING_MIN_GOLFERS` and `VITE_BILLING_PRICE_PER_GOLFER`)
- Public support and policy links (`VITE_SUPPORT_EMAIL`, `VITE_PRIVACY_POLICY_URL`,
  `VITE_TERMS_URL`, and `VITE_REFUND_POLICY_URL`)

## Local development

1. Install dependencies.
2. Set the env vars above.
3. Run `npm run dev`.

## Production

1. Set production `VITE_API_URL`.
2. Build with `npm run build`.
3. Start the production static server with `npm start`.

Production builds fail immediately if `VITE_API_URL` is absent, invalid, or does not end in `/api`.
Railway builds additionally require HTTPS. The committed Railway configuration builds the client,
serves `dist/` with SPA route fallback, and checks `/` before activating a deployment. The start
command explicitly loads `dist/serve.json`, so static responses include the committed security
headers and immutable caching for fingerprinted assets.

GitHub Actions runs type-checking, unit tests, lint, and the production build on every push and pull
request. Weekly Dependabot updates are also configured in this repository.

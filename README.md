# Client

## Required environment variables

Copy `.env.example` to `.env` and set:

- `VITE_API_URL`

Optional:

- Billing display overrides (`VITE_BILLING_MIN_GOLFERS` and `VITE_BILLING_PRICE_PER_GOLFER`)

## Local development

1. Install dependencies.
2. Set the env vars above.
3. Run `npm run dev`.

## Production

1. Set production `VITE_API_URL`.
2. Build with `npm run build`.
3. Start the production static server with `npm start`.

The committed Railway configuration builds the client, serves `dist/` with SPA route fallback, and
checks `/` before activating a deployment. Static responses include the production security headers
defined in `public/serve.json`.

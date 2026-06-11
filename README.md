# Client

## Required environment variables

Copy `.env.example` to `.env` and set:

- `VITE_API_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Optional:

- `VITE_GOOGLE_AUTH_URL`

## Local development

1. Install dependencies.
2. Set the env vars above.
3. Run `npm run dev`.

## Production

1. Set production `VITE_API_URL`.
2. Set the live Stripe publishable key.
3. Build with `npm run build`.
4. Serve the generated `dist/` directory behind your CDN or web server.

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BILLING_MIN_GOLFERS?: string;
  readonly VITE_BILLING_PRICE_PER_GOLFER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

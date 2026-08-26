/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BILLING_MIN_GOLFERS?: string;
  readonly VITE_BILLING_PRICE_PER_GOLFER?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_PRIVACY_POLICY_URL?: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_REFUND_POLICY_URL?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

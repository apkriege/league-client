const getHttpsUrl = (value: string | undefined) => {
  try {
    const url = new URL(value?.trim() || "");
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

export const DEFAULT_SUPPORT_EMAIL = "support@leaguenightpro.com";

const configuredSupportEmail =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
const supportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredSupportEmail)
  ? configuredSupportEmail
  : null;

export const publicLinks = {
  supportEmail,
  privacy: getHttpsUrl(import.meta.env.VITE_PRIVACY_POLICY_URL) ?? "/privacy",
  terms: getHttpsUrl(import.meta.env.VITE_TERMS_URL) ?? "/terms",
  refunds: getHttpsUrl(import.meta.env.VITE_REFUND_POLICY_URL) ?? "/refunds",
};

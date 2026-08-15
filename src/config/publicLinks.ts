const getHttpsUrl = (value: string | undefined) => {
  try {
    const url = new URL(value?.trim() || "");
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const configuredSupportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "";
const supportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredSupportEmail)
  ? configuredSupportEmail
  : null;

export const publicLinks = {
  supportEmail,
  privacy: getHttpsUrl(import.meta.env.VITE_PRIVACY_POLICY_URL),
  terms: getHttpsUrl(import.meta.env.VITE_TERMS_URL),
  refunds: getHttpsUrl(import.meta.env.VITE_REFUND_POLICY_URL),
};

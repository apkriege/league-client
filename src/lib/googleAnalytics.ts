const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]+$/i;

type GtagCommand = "config" | "event" | "js";
type Gtag = (command: GtagCommand, target: string | Date, parameters?: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const isGoogleAnalyticsMeasurementId = (value: unknown): value is string =>
  typeof value === "string" && GOOGLE_ANALYTICS_ID_PATTERN.test(value.trim());

const getMeasurementId = () => import.meta.env.VITE_GOOGLE_ANALYTICS_ID?.trim() ?? "";

export const initializeGoogleAnalytics = (): boolean => {
  const measurementId = getMeasurementId();
  if (!import.meta.env.PROD || !isGoogleAnalyticsMeasurementId(measurementId)) return false;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args) => {
    window.dataLayer?.push(args);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
  return true;
};

export const trackGoogleAnalyticsPageView = (pathname: string): void => {
  const measurementId = getMeasurementId();
  if (!window.gtag || !isGoogleAnalyticsMeasurementId(measurementId)) return;

  const pagePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  window.gtag("event", "page_view", {
    send_to: measurementId,
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: document.title,
  });
};

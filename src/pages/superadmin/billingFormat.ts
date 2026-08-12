export const formatBillingCurrency = (amountCents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);

export const formatBillingDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatCheckoutPurpose = (purpose: string) =>
  ({
    registration: "League registration",
    seat_upgrade: "Account capacity",
    league_capacity: "League capacity",
  })[purpose] || purpose.replaceAll("_", " ");

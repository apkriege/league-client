export const getCheckoutReturn = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    checkout: params.get("checkout"),
    sessionId: params.get("session_id"),
  };
};

export const clearCheckoutReturnFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  params.delete("checkout");
  params.delete("session_id");
  const query = params.toString();
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
  );
};

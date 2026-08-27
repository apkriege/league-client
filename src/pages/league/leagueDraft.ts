export const CREATE_LEAGUE_DRAFT_STORAGE_KEY = "create-league-draft";

export const clearCreateLeagueDraft = () => {
  window.localStorage.removeItem(CREATE_LEAGUE_DRAFT_STORAGE_KEY);
};

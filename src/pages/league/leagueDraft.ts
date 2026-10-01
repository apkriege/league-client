import { removeBrowserStorage } from "@/lib/browserStorage";

const CREATE_LEAGUE_DRAFT_STORAGE_KEY = "create-league-draft";

export const getCreateLeagueDraftStorageKey = (userId: number) =>
  `${CREATE_LEAGUE_DRAFT_STORAGE_KEY}:${userId}`;

export const clearCreateLeagueDraft = (userId: number) => {
  removeBrowserStorage(getCreateLeagueDraftStorageKey(userId));
  removeBrowserStorage(`${getCreateLeagueDraftStorageKey(userId)}:step`);
};

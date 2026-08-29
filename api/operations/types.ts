export type LeagueAnnouncementAuthor = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export type LeagueAnnouncement = {
  id: number;
  leagueId: number;
  authorUserId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: LeagueAnnouncementAuthor | null;
};

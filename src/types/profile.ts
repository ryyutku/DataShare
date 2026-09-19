export interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  karma: number;
  contributionsCount: number;
  cakeDay: string;
  followersCount: number;
  activeCommunitiesCount: number;
  trophies: string[];
  achievementsCount: number;
}
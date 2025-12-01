export type SocialMediaPlatform = "tiktok" | "snapchat";

export interface TrackingStatus {
  isTracking: boolean;
  platforms: SocialMediaPlatform[];
}

export interface PendingStreak {
  id: number;
  partnerId: number;
  partnerName: string;
  socialMedia: SocialMediaPlatform;
  createdAt: string;
}

export interface PlatformStreakData {
  user: {
    count: number;
    lastEnded: string | null;
  };
  partner: {
    count: number;
    lastEnded: string | null;
  };
}

export interface StreakData {
  isTracking: boolean;
  platforms: SocialMediaPlatform[];
  user: {
    id: number;
    name: string;
  };
  partner: {
    id: number;
    name: string;
  };
  byPlatform: {
    [key: string]: PlatformStreakData;
  };
}

export interface StreakHistoryEntry {
  id: number;
  createdAt: string;
}

export interface StreakHistory {
  platform: SocialMediaPlatform;
  user: {
    id: number;
    name: string;
    count: number;
    history: StreakHistoryEntry[];
  };
  partner: {
    id: number;
    name: string;
    count: number;
    history: StreakHistoryEntry[];
  };
}

export interface RecentStreakMessage {
  userName: string;
  platform: SocialMediaPlatform;
  createdAt: string;
}

export interface StreakPreview {
  message: string;
  type: "neutral" | "warning" | "recent" | "achievement" | "positive" | "scoreboard";
  userId?: number;
  countA?: number;
  countB?: number;
  userA: {
    id: number;
    name: string;
  };
  userB: {
    id: number;
    name: string;
  };
  updatedAt: string;
}

export const PLATFORM_NAMES: { [key in SocialMediaPlatform]: string } = {
  tiktok: "TikTok",
  snapchat: "Snapchat",
};

export const PLATFORM_COLORS: { [key in SocialMediaPlatform]: string } = {
  tiktok: "#000000",
  snapchat: "#FFFC00",
};


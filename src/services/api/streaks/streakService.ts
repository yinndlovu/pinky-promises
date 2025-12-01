import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export type SocialMediaPlatform = "tiktok" | "snapchat";

export interface TrackingStatus {
  isTracking: boolean;
  platforms: SocialMediaPlatform[];
}

export interface StartTrackingResponse {
  success: boolean;
  message: string;
  tracking: any[];
}

export interface StopTrackingResponse {
  success: boolean;
  message: string;
}

export interface LogEndedStreakResponse {
  success: boolean;
  message: string;
  streak: any;
  requiresConfirmation: boolean;
}

export interface PendingStreak {
  id: number;
  partnerId: number;
  partnerName: string;
  socialMedia: SocialMediaPlatform;
  createdAt: string;
}

export interface PendingEndedStreakResponse {
  pendingEndedStreak: boolean;
  streak: PendingStreak | null;
}

export interface ConfirmStreakResponse {
  success: boolean;
  message: string;
  verified: boolean;
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
  type:
    | "neutral"
    | "warning"
    | "recent"
    | "achievement"
    | "positive"
    | "scoreboard";
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

// start tracking streaks
export async function startTracking(
  token: string,
  platforms: SocialMediaPlatform[]
): Promise<StartTrackingResponse> {
  const response = await axios.post(
    `${BASE_URL}/streak/start`,
    { platforms },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// stop tracking a platform
export async function stopTracking(
  token: string,
  platform: SocialMediaPlatform
): Promise<StopTrackingResponse> {
  const response = await axios.post(
    `${BASE_URL}/streak/stop`,
    { platform },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// get tracking status
export async function getTrackingStatus(
  token: string
): Promise<TrackingStatus> {
  const response = await axios.get(`${BASE_URL}/streak/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// log an ended streak
export async function logEndedStreak(
  token: string,
  accusedUserId: number,
  socialMedia: SocialMediaPlatform
): Promise<LogEndedStreakResponse> {
  const response = await axios.post(
    `${BASE_URL}/streak/log`,
    { accusedUserId, socialMedia },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// get pending ended streak (single)
export async function getPendingEndedStreak(
  token: string
): Promise<PendingEndedStreakResponse> {
  const response = await axios.get(`${BASE_URL}/streak/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// get all pending ended streaks
export async function getAllPendingEndedStreaks(
  token: string
): Promise<PendingStreak[]> {
  const response = await axios.get(`${BASE_URL}/streak/pending/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// confirm or deny an ended streak accusation
export async function confirmEndedStreak(
  token: string,
  streakId: number,
  confirmed: boolean
): Promise<ConfirmStreakResponse> {
  const response = await axios.post(
    `${BASE_URL}/streak/confirm`,
    { streakId, confirmed },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

// get full streak data
export async function getStreakData(token: string): Promise<StreakData> {
  const response = await axios.get(`${BASE_URL}/streak/data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// get streak history for a platform
export async function getStreakHistory(
  token: string,
  platform: SocialMediaPlatform
): Promise<StreakHistory> {
  const response = await axios.get(`${BASE_URL}/streak/history/${platform}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// get recent streak message for home screen
export async function getRecentStreakMessage(
  token: string
): Promise<RecentStreakMessage | null> {
  const response = await axios.get(`${BASE_URL}/streak/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// get streak preview message from Redis (fast, cached by job)
export async function getStreakPreview(
  token: string
): Promise<StreakPreview | null> {
  const response = await axios.get(`${BASE_URL}/streak/preview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

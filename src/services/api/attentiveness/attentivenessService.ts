import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export interface AttentivenessMessage {
  type: "attentiveness" | "interaction_highlight" | "leaderboard";
  message: string;
  subMessage?: string;
  data?: {
    interactions?: number;
    sweetMessages?: number;
    period?: string;
    action?: string;
    count?: number;
    user?: {
      name: string;
      score: number;
    };
    partner?: {
      name: string;
      score: number;
    };
  };
}

export interface AttentivenessInsights {
  messages: AttentivenessMessage[];
  weekKey: string;
  currentWeekKey?: string;
  updatedAt: string;
}

// get attentiveness insights for the current user
export async function getAttentivenessInsights(
  token: string
): Promise<AttentivenessInsights | null> {
  const response = await axios.get(`${BASE_URL}/attentiveness/insights`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || null;
}

// mark attentiveness insights as shown
export async function markAttentivenessInsightsAsShown(
  token: string,
  weekKey: string
): Promise<void> {
  await axios.post(
    `${BASE_URL}/attentiveness/insights/mark-shown`,
    { weekKey },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}


export type PeriodProblem =
  | "cramps"
  | "bloating"
  | "headaches"
  | "fatigue"
  | "mood_swings"
  | "back_pain"
  | "nausea"
  | "breast_tenderness"
  | "acne"
  | "insomnia"
  | "cravings"
  | "anxiety"
  | "irritability"
  | "dizziness"
  | "hot_flashes";

export type PeriodAidCategory =
  | "what_to_do"
  | "what_to_avoid"
  | "food_to_eat"
  | "food_to_avoid"
  | "exercises"
  | "self_care"
  | "supplements"
  | "general_tip";

export const PeriodProblemLabels: Record<PeriodProblem, string> = {
  cramps: "Cramps",
  bloating: "Bloating",
  headaches: "Headaches",
  fatigue: "Fatigue",
  mood_swings: "Mood Swings",
  back_pain: "Back Pain",
  nausea: "Nausea",
  breast_tenderness: "Breast Tenderness",
  acne: "Acne",
  insomnia: "Insomnia",
  cravings: "Cravings",
  anxiety: "Anxiety",
  irritability: "Irritability",
  dizziness: "Dizziness",
  hot_flashes: "Hot Flashes",
};

export const PeriodAidCategoryLabels: Record<PeriodAidCategory, string> = {
  what_to_do: "What To Do",
  what_to_avoid: "What To Avoid",
  food_to_eat: "Food To Eat",
  food_to_avoid: "Food To Avoid",
  exercises: "Exercises",
  self_care: "Self Care",
  supplements: "Supplements",
  general_tip: "General Tips",
};

export const PeriodProblemEmojis: Record<PeriodProblem, string> = {
  cramps: "😣",
  bloating: "🫧",
  headaches: "🤕",
  fatigue: "😴",
  mood_swings: "🎭",
  back_pain: "🔙",
  nausea: "🤢",
  breast_tenderness: "💔",
  acne: "🔴",
  insomnia: "🌙",
  cravings: "🍫",
  anxiety: "😰",
  irritability: "😤",
  dizziness: "💫",
  hot_flashes: "🔥",
};

export interface PeriodCycle {
  id: number;
  userId: number;
  partnerId: number | null;
  startDate: string;
  endDate: string | null;
  nextPredictedDate: string | null;
  cycleLength: number;
  periodLength: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: number;
    name: string;
    username: string;
  };
  Partner?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface PeriodAid {
  id: number;
  problem: PeriodProblem;
  category: PeriodAidCategory;
  title: string;
  description: string | null;
  priority: number;
  isAdminCreated: boolean;
  createdByUserId: number | null;
  forUserId: number | null;
  CreatedBy?: {
    id: number;
    name: string;
    username: string;
  };
}

export interface UserIssue {
  id: number;
  cycleId: number;
  userId: number;
  partnerId: number | null;
  problem: PeriodProblem;
  severity: number;
  notes: string | null;
  logDate: string;
  createdAt: string;
  Cycle?: PeriodCycle;
  LoggedByPartner?: {
    id: number;
    name: string;
    username: string;
  };
  aids?: (PeriodAid | CustomPeriodAid)[];
}

export interface CustomPeriodAid {
  id: number;
  userId: number;
  problem: PeriodProblem;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PeriodLookout {
  id: number;
  userId: number;
  partnerId: number | null;
  title: string;
  description: string | null;
  showOnDate: string;
  showUntilDate: string | null;
  isAdminCreated: boolean;
  isSeen: boolean;
  priority: number;
  CreatedBy?: {
    id: number;
    name: string;
    username: string;
  };
}

export type PeriodStatusType = "on_period" | "waiting" | "late" | "no_data";

export interface PeriodStatus {
  status: PeriodStatusType;
  daysSinceStart?: number;
  daysUntilNext?: number;
  daysUntilOvulation?: number;
  daysLate?: number;
  expectedEndDay?: number;
  expectedDate?: string;
  ovulationDate?: string;
  cycle?: PeriodCycle;
  lastCycle?: PeriodCycle;
  message?: string;
}

export type PeriodRole = "period_user" | "partner" | "none";

export interface PeriodRoleInfo {
  role: PeriodRole;
  periodUser: {
    id: number;
    userId: number;
    partnerId: number | null;
    User?: {
      id: number;
      name: string;
      username: string;
    };
  } | null;
}

export interface PeriodOverview {
  status: PeriodStatus;
  todaysIssues: UserIssue[];
  aidsForToday: {
    problem: PeriodProblem;
    severity: number;
    aids: (PeriodAid | CustomPeriodAid)[];
  }[];
  commonIssues: {
    problem: PeriodProblem;
    count: number;
    avgSeverity: string;
  }[];
  recentCycles: PeriodCycle[];
  lookouts: PeriodLookout[];
  averages: {
    cycleLength: number;
    periodLength: number;
  };
  role: PeriodRole;
  periodUserId?: number;
  periodUserName?: string;
}


import axios from "axios";
import { BASE_URL } from "../../../configuration/config";
import {
  PeriodOverview,
  PeriodStatus,
  PeriodCycle,
  PeriodAid,
  UserIssue,
  CustomPeriodAid,
  PeriodLookout,
  PeriodProblem,
  PeriodAidCategory,
  PeriodRoleInfo,
} from "../../../types/Period";

// ==================== PERIOD ROLE ====================

export async function getPeriodRole(token: string): Promise<PeriodRoleInfo> {
  const response = await axios.get(`${BASE_URL}/period/role`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ==================== PERIOD CYCLE ====================

export async function getPeriodStatus(token: string): Promise<PeriodStatus> {
  const response = await axios.get(`${BASE_URL}/period/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getPartnerPeriodStatus(token: string): Promise<PeriodStatus> {
  const response = await axios.get(`${BASE_URL}/period/partner-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getPeriodOverview(token: string): Promise<PeriodOverview> {
  const response = await axios.get(`${BASE_URL}/period/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getCycleHistory(
  token: string,
  limit: number = 12
): Promise<PeriodCycle[]> {
  const response = await axios.get(`${BASE_URL}/period/history?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function startPeriod(
  token: string,
  userId: number,
  startDate?: string
): Promise<{ message: string; cycle: PeriodCycle }> {
  const response = await axios.post(
    `${BASE_URL}/period/start`,
    { userId, startDate },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function endPeriod(
  token: string,
  cycleId: number,
  endDate?: string
): Promise<{ message: string; cycle: PeriodCycle }> {
  const response = await axios.put(
    `${BASE_URL}/period/cycle/${cycleId}/end`,
    { endDate },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function updateCycleSettings(
  token: string,
  cycleId: number,
  updates: Partial<PeriodCycle>
): Promise<{ message: string; cycle: PeriodCycle }> {
  const response = await axios.put(
    `${BASE_URL}/period/cycle/${cycleId}`,
    updates,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function updateNextPredictedDate(
  token: string,
  cycleId: number,
  nextPredictedDate: string
): Promise<{ message: string; cycle: PeriodCycle }> {
  const response = await axios.put(
    `${BASE_URL}/period/cycle/${cycleId}/predict`,
    { nextPredictedDate },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ==================== USER ISSUES ====================

export async function logIssue(
  token: string,
  data: {
    problem: PeriodProblem;
    severity?: number;
    notes?: string;
    logDate?: string;
    cycleId?: number;
  }
): Promise<{ message: string; issue: UserIssue; helpfulAids: PeriodAid[] }> {
  const response = await axios.post(`${BASE_URL}/period/issue`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getTodaysIssues(token: string): Promise<UserIssue[]> {
  const response = await axios.get(`${BASE_URL}/period/issues/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getIssuesForCycle(
  token: string,
  cycleId: number
): Promise<UserIssue[]> {
  const response = await axios.get(`${BASE_URL}/period/cycle/${cycleId}/issues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getIssueAnalytics(token: string): Promise<{
  commonIssues: { problem: PeriodProblem; count: number; avgSeverity: string }[];
  recentIssues: UserIssue[];
  issuesByDay: Record<string, UserIssue[]>;
  totalIssuesLastMonth: number;
}> {
  const response = await axios.get(`${BASE_URL}/period/issues/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateIssue(
  token: string,
  issueId: number,
  updates: Partial<UserIssue>
): Promise<{ message: string; issue: UserIssue }> {
  const response = await axios.put(
    `${BASE_URL}/period/issue/${issueId}`,
    updates,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteIssue(
  token: string,
  issueId: number
): Promise<{ message: string }> {
  const response = await axios.delete(`${BASE_URL}/period/issue/${issueId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ==================== PERIOD AIDS ====================

export async function getAllAids(token: string): Promise<{
  aids: PeriodAid[];
  grouped: Record<PeriodProblem, Record<PeriodAidCategory, PeriodAid[]>>;
}> {
  const response = await axios.get(`${BASE_URL}/period/aids`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getAidsForProblem(
  token: string,
  problem: PeriodProblem
): Promise<PeriodAid[]> {
  const response = await axios.get(`${BASE_URL}/period/aids/problem/${problem}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getAidsByCategory(
  token: string,
  category: PeriodAidCategory
): Promise<PeriodAid[]> {
  const response = await axios.get(`${BASE_URL}/period/aids/category/${category}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createPartnerAid(
  token: string,
  data: {
    forUserId: number;
    problem: PeriodProblem;
    category: PeriodAidCategory;
    title: string;
    description?: string;
    priority?: number;
  }
): Promise<{ message: string; aid: PeriodAid }> {
  const response = await axios.post(`${BASE_URL}/period/aid`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ==================== CUSTOM PERIOD AIDS ====================

export async function getCustomAids(
  token: string,
  activeOnly: boolean = true
): Promise<{ aids: CustomPeriodAid[]; grouped: Record<PeriodProblem, CustomPeriodAid[]> }> {
  const response = await axios.get(
    `${BASE_URL}/period/custom-aids?activeOnly=${activeOnly}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function createCustomAid(
  token: string,
  data: {
    problem: PeriodProblem;
    title: string;
    description?: string;
  }
): Promise<{ message: string; aid: CustomPeriodAid }> {
  const response = await axios.post(`${BASE_URL}/period/custom-aid`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateCustomAid(
  token: string,
  aidId: number,
  updates: Partial<CustomPeriodAid>
): Promise<{ message: string; aid: CustomPeriodAid }> {
  const response = await axios.put(
    `${BASE_URL}/period/custom-aid/${aidId}`,
    updates,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function toggleCustomAid(
  token: string,
  aidId: number
): Promise<{ message: string; aid: CustomPeriodAid }> {
  const response = await axios.put(
    `${BASE_URL}/period/custom-aid/${aidId}/toggle`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteCustomAid(
  token: string,
  aidId: number
): Promise<{ message: string }> {
  const response = await axios.delete(`${BASE_URL}/period/custom-aid/${aidId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ==================== PERIOD LOOKOUTS ====================

export async function getLookouts(token: string): Promise<PeriodLookout[]> {
  const response = await axios.get(`${BASE_URL}/period/lookouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getUnseenLookouts(token: string): Promise<PeriodLookout[]> {
  const response = await axios.get(`${BASE_URL}/period/lookouts/unseen`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createLookout(
  token: string,
  data: {
    userId: number;
    title: string;
    description?: string;
    showOnDate: string;
    showUntilDate?: string;
    priority?: number;
  }
): Promise<{ message: string; lookout: PeriodLookout }> {
  const response = await axios.post(`${BASE_URL}/period/lookout`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function markLookoutSeen(
  token: string,
  lookoutId: number
): Promise<{ message: string; lookout: PeriodLookout }> {
  const response = await axios.put(
    `${BASE_URL}/period/lookout/${lookoutId}/seen`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function markAllLookoutsSeen(
  token: string
): Promise<{ message: string }> {
  const response = await axios.put(
    `${BASE_URL}/period/lookouts/seen-all`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteLookout(
  token: string,
  lookoutId: number
): Promise<{ message: string }> {
  const response = await axios.delete(`${BASE_URL}/period/lookout/${lookoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ==================== ENUMS ====================

export async function getEnums(token: string): Promise<{
  problems: Record<string, PeriodProblem>;
  categories: Record<string, PeriodAidCategory>;
}> {
  const response = await axios.get(`${BASE_URL}/period/enums`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


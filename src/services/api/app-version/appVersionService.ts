import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export interface AppVersionInfo {
  id: number;
  version: string;
  downloadUrl: string;
  notes?: string | null;
  mandatory: boolean;
  createdAt: string;
}

export async function getLatestVersion(): Promise<AppVersionInfo> {
  const response = await axios.get(`${BASE_URL}/version/latest`);

  return response.data.latestVersion;
}

export function compareVersions(
  currentVersion: string,
  latestVersion: string
): number {
  const current = currentVersion.split(".").map(Number);
  const latest = latestVersion.split(".").map(Number);

  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const currentPart = current[i] || 0;
    const latestPart = latest[i] || 0;

    if (currentPart < latestPart) {
      return -1;
    }

    if (currentPart > latestPart) {
      return 1;
    }
  }

  return 0;
}

export function shouldShowUpdate(
  currentVersion: string,
  latestVersion: string
): boolean {
  return compareVersions(currentVersion, latestVersion) < 0;
}

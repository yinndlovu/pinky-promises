export interface AppVersionInfo {
  id: number;
  version: string;
  downloadUrl: string;
  notes?: string | null;
  mandatory: boolean;
  createdAt: string;
}

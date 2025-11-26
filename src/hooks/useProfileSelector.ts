import { useQueryClient } from "@tanstack/react-query";

export const useProfileSelector = <T>(
  userId: string | undefined,
  selector: (profile: any) => T
): T | undefined => {
  const qc = useQueryClient();

  if (!userId) {
    return;
  }

  const profileData = qc.getQueryData(["profile", userId]);
  if (!profileData) {
    return;
  }

  return selector(profileData);
};

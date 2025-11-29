import { useQueryClient } from "@tanstack/react-query";

export const useGiftsSelector = <T>(
  userId: string | undefined,
  selector: (gifts: any) => T
): T | undefined => {
  const qc = useQueryClient();

  if (!userId) {
    return undefined;
  }

  const giftsData = qc.getQueryData(["gifts", userId]);

  if (!giftsData) {
    return undefined;
  }

  return selector(giftsData);
};

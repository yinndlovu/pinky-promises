import { useQueryClient } from "@tanstack/react-query";

export const useHomeSelector = <T>(
  userId: string | undefined,
  selector: (home: any) => T
): T | undefined => {
  const qc = useQueryClient();

  if (!userId) {
    return undefined;
  }

  const homeData = qc.getQueryData(["home", userId]);

  if (!homeData) {
    return undefined;
  }

  return selector(homeData);
};

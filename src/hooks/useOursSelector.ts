import { useQueryClient } from "@tanstack/react-query";

export const useOursSelector = <T>(
  userId: string | undefined,
  selector: (ours: any) => T
): T | undefined => {
  const qc = useQueryClient();

  if (!userId) {
    return undefined;
  }

  const oursData = qc.getQueryData(["ours", userId]);

  if (!oursData) {
    return undefined;
  }

  return selector(oursData);
};

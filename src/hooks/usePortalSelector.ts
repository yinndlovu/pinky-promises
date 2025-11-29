import { useQueryClient } from "@tanstack/react-query";

export const usePortalSelector = <T>(
  userId: string | undefined,
  selector: (portal: any) => T
): T | undefined => {
  const qc = useQueryClient();

  if (!userId) {
    return undefined;
  }

  const portalData = qc.getQueryData(["portal", userId]);
  if (!portalData) {
    return undefined;
  }

  return selector(portalData);
};

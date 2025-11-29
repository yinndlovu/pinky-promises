import { useQuery } from "@tanstack/react-query";
import { getPortalData } from "../services/api/portal/portalService";

export function usePortal(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["portal", userId],
    queryFn: async () => {
      return await getPortalData(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 15,
  });
}

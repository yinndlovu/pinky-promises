import { useQuery } from "@tanstack/react-query";
import { getPartner } from "../services/api/profiles/partnerService";

export function usePartner(userId: string, token: string) {
  return useQuery({
    queryKey: ["partnerData", userId],
    queryFn: async () => {
      return await getPartner(token);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

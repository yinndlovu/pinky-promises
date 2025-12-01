import { useQuery } from "@tanstack/react-query";
import {
  getPeriodOverview,
  getPartnerPeriodStatus,
} from "../services/api/period/periodService";

export function usePeriod(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["period", userId],
    queryFn: async () => {
      return await getPeriodOverview(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5, 
  });
}

export function usePartnerPeriodStatus(
  token: string | null,
  hasPartner: boolean
) {
  return useQuery({
    queryKey: ["partnerPeriodStatus"],
    queryFn: async () => {
      return await getPartnerPeriodStatus(token!);
    },
    enabled: !!token && hasPartner,
    staleTime: 1000 * 60 * 5,
  });
}

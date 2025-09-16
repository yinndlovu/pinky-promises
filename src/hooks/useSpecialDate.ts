import { useQuery } from "@tanstack/react-query";
import { getSpecialDates } from "../services/api/ours/specialDateService";

export function useSpecialDates(userId: string, token: string) {
  return useQuery({
    queryKey: ["specialDates", userId],
    queryFn: async () => {
      return await getSpecialDates(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}

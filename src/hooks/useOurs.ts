import { useQuery } from "@tanstack/react-query";
import { getOursData } from "../services/api/ours/oursService";

export function useOurs(token: string | null, userId?: string) {
  return useQuery({
    queryKey: ["ours", userId],
    queryFn: async () => {
      return await getOursData(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 15,
  });
}

import { useQuery } from "@tanstack/react-query";
import { getAboutUser } from "../services/api/profiles/aboutUserService";

export function useAbout(userId: string, token: string | undefined) {
  return useQuery({
    queryKey: ["about", userId],
    queryFn: async () => {
      if (!token) {
        return;
      }
      
      return await getAboutUser(token, userId);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60,
  });
}

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHomeScreenData } from "../services/api/home/homeService";
import { useHomeStore } from "../stores/homeStore";

export function useHome(token: string | null, userId?: string) {
  const query = useQuery({
    queryKey: ["home", userId],
    queryFn: async () => {
      return await getHomeScreenData(token!);
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  /** useHome stays the source of truth for loading/error/refetch.
   * the moment there is server data,
   * we push it into the home store, which is what socket events and every
   * useHomeSelector() consumer now read from
   **/
  useEffect(() => {
    if (query.data) {
      useHomeStore.getState().hydrate(query.data);
    }
  }, [query.data]);

  return query;
}

import { useQuery } from "@tanstack/react-query";
import { getNotes } from "../services/api/ours/notesService";

export function useNotesPreview(userId: string, token: string) {
  return useQuery({
    queryKey: ["notesPreview", userId],
    queryFn: async () => {
      return await getNotes(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 5,
  });
}

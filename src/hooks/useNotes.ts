import { useQuery } from "@tanstack/react-query";
import { getNotes } from "../services/api/ours/notesService";

export function useNotesPreview(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["notesPreview", userId],
    queryFn: async () => {
      if (!token) {
        return;
      }
      
      return await getNotes(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 5,
  });
}

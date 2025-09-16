import { useState, useCallback } from "react";
import { fetchProfilePicture } from "../services/api/profiles/profileService";

export function useProfilePicture(userId: string, token: string) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );

  const fetchPicture = useCallback(async () => {
    try {
      const { uri, updatedAt } = await fetchProfilePicture(userId, token);

      setAvatarUri(uri);
      setProfilePicUpdatedAt(updatedAt);
    } catch (err: any) {
      if (![404, 500].includes(err.response?.status)) {
        console.error("Error fetching profile picture:", err);
      }
    }
  }, [userId, token]);

  return { avatarUri, profilePicUpdatedAt, fetchPicture };
}

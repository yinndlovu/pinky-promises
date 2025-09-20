import { useQuery } from "@tanstack/react-query";
import {
  getLastFiveClaimedGifts,
  getOldestUnclaimedGift,
} from "../services/api/gifts/monthlyGiftService";
import { getSetMonthlyGift } from "../services/api/gifts/setMonthlyGiftService";
import { formatDateDMY, formatTime } from "../utils/formatters/formatDate";

export function useGift(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["unclaimedGift", userId],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      return await getOldestUnclaimedGift(token);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 15,
  });
}

export function usePastGifts(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["pastGifts", userId],
    queryFn: async () => {
      if (!token) {
        return [];
      }

      const gifts = await getLastFiveClaimedGifts(token);

      return gifts.map((gift: any) => ({
        id: gift.id,
        giftName: gift.name,
        receivedAt:
          formatDateDMY(gift.createdAt) + " " + formatTime(gift.createdAt),
        claimedAt:
          formatDateDMY(gift.claimDate) + " " + formatTime(gift.claimDate),
      }));
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useSetMonthlyGift(userId: string, token: string | null) {
  return useQuery({
    queryKey: ["setMonthlyGift", userId],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      return await getSetMonthlyGift(token, userId);
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 24 * 3,
  });
}

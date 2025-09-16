import { useQuery } from "@tanstack/react-query";
import { getItems, getCartTotal } from "../services/api/gifts/cartService";

export function useCartItems(userId: string, token: string) {
  return useQuery({
    queryKey: ["cartItems", userId],
    queryFn: async () => {
      const response = await getItems(token);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 24 * 3,
  });
}

export function useCartTotal(userId: string, token: string) {
  return useQuery({
    queryKey: ["cartTotal", userId],
    queryFn: async () => {
      const totalData = await getCartTotal(token);
      return totalData.total || 0;
    },
    enabled: !!userId && !!token,
    staleTime: 1000 * 60 * 60 * 24 * 3,
  });
}

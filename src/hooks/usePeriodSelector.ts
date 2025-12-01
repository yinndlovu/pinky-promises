import { useQueryClient } from "@tanstack/react-query";
import { PeriodOverview } from "../types/Period";

export function usePeriodSelector<T>(
  userId: string | undefined,
  selector: (data: PeriodOverview | undefined) => T
): T | undefined {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<PeriodOverview>(["period", userId]);
  return selector(data);
}


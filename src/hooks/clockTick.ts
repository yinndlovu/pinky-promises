import { useEffect, useState } from "react";

export const useClockTick = (intervalMs: number = 60000) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
};

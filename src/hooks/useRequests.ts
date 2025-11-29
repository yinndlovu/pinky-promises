import { useEffect, useState } from "react";
import { getReceivedRequestsCount } from "../services/api/profiles/partnerService";

export function useRequestsCount(token: string | null) {
  const [requestsCount, setRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchCount = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const count = await getReceivedRequestsCount(token);
      setRequestsCount(count);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [token]);

  return {
    requestsCount,
    loading,
    error,
    refetch: fetchCount,
  };
}

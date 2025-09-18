import { useAuth } from "../contexts/AuthContext";
import useToken from "./useToken";
import { usePartner } from "./usePartner";

export default function usePartnerId() {
  const { user } = useAuth();
  const token = useToken();

  const { data: partner } = usePartner(user?.id, token ?? null);

  return partner?.id as string | undefined;
}

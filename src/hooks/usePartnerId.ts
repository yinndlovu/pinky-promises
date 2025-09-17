import { useAuth } from "../contexts/AuthContext";
import useToken from "./useToken";
import { usePartner } from "./usePartner";

export default function usePartnerId() {
  const { user } = useAuth();
  const token = useToken();

  if (!token) {
    return;
  }
  const { data: partner } = usePartner(user?.id, token);

  return partner?.id as string | undefined;
}

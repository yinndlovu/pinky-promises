import { useAuth } from "../contexts/AuthContext";

const useToken = () => {
  const { token } = useAuth();
  return token;
};

export default useToken;

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

const useToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);

  return token;
};

export default useToken;

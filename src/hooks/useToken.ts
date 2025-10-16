import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const useToken = () => {
  const { token } = useAuth();
  return token;
};

export default useToken;

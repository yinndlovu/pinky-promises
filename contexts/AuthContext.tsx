import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../configuration/config";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (token: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return false;
      }

      const response = await axios.get(`${BASE_URL}/api/auth/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      await AsyncStorage.removeItem("token");
      return false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const isValid = await validateToken();
      setIsAuthenticated(isValid);
    } catch (error) {
      console.log("Error checking auth status:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData?: any) => {
    await AsyncStorage.setItem("token", token);
    if (userData) {
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        validateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

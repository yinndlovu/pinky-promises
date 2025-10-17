// external
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// internal
import { BASE_URL } from "../configuration/config";
import { AuthContextType } from "../interfaces/AuthContextType";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // use states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // use effects
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return false;
      }

      setToken(token);

      const response = await axios.get(`${BASE_URL}/auth/validate-token`, {
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
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        await AsyncStorage.removeItem("token");
        return false;
      }

      return true;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const isValid = await validateToken();

      setIsAuthenticated(isValid);
    } catch (error) {
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
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
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

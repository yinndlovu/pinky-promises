// external
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import * as Updates from "expo-updates";

// internal
import { lightTheme, darkTheme } from "./themes";

type Mode = "system" | "light" | "dark";

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  theme: typeof lightTheme;
};

const ThemeContext = createContext<Ctx | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>("system");
  const systemScheme = useColorScheme();
  const effectiveScheme = systemScheme ?? "light";

  useEffect(() => {
    AsyncStorage.getItem("themeMode").then((m) => {
      if (m === "light" || m === "dark" || m === "system") {
        setMode(m);
      }
    });
  }, []);

  const active = mode === "system" ? effectiveScheme : mode;
  const theme = active === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      mode,
      setMode: async (m: Mode) => {
        setMode(m);
        try {
          await AsyncStorage.setItem("themeMode", m);
          await Updates.reloadAsync();
        } catch (e) {
          console.log("failed to restart", e);
        }
      },
      theme,
    }),
    [mode, theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};

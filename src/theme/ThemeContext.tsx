// external
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
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
  const [mode, setModeState] = useState<Mode>("system");
  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(
    () => Appearance.getColorScheme() ?? "light"
  );

  useEffect(() => {
    AsyncStorage.getItem("themeMode").then((m) => {
      if (m === "light" || m === "dark" || m === "system") {
        setModeState(m);
      }
    });
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? "light");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const active = mode === "system" ? systemScheme : mode;
  const theme = active === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      mode,
      setMode: async (m: Mode) => {
        setModeState(m);
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

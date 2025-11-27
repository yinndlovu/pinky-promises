// ThemeProvider.serverDriven.tsx
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

import { lightTheme, darkTheme } from "./themes";
import { AccentThemeName, accentThemes } from "./accentThemes";
import useToken from "../hooks/useToken";
import { getServerTheme } from "../services/api/theme/themeService";

type Mode = "system" | "light" | "dark";

type ServerTheme = {
  accent?: string | null;
};

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => Promise<void>;
  accent: AccentThemeName;
  theme: typeof lightTheme;
};

const ThemeContext = createContext<Ctx | null>(null);

const ACCENT_STORAGE_KEY = "serverAccentTheme_v1";
const MODE_STORAGE_KEY = "themeMode";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // hook variables
  const token = useToken();

  // use states
  const [mode, setModeState] = useState<Mode>("system");
  const [accent, setAccent] = useState<AccentThemeName>("default");
  // resolver for system mode
  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(
    () => Appearance.getColorScheme() ?? "light"
  );

  // load cached accent and cached mode
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [savedAccent, savedMode] = await Promise.all([
          AsyncStorage.getItem(ACCENT_STORAGE_KEY),
          AsyncStorage.getItem(MODE_STORAGE_KEY),
        ]);

        if (!mounted) {
          return;
        }

        if (savedAccent && savedAccent in accentThemes) {
          setAccent(savedAccent as AccentThemeName);
        }

        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setModeState(savedMode as Mode);
        }
      } catch (e) {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // listen to system changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? "light");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const response = (await getServerTheme(token)) as ServerTheme | null;
        const serverAccent =
          (response as any)?.accentTheme ??
          (response as any)?.accentTheme ??
          null;

        if (serverAccent && serverAccent in accentThemes) {
          const name = serverAccent as AccentThemeName;
          if (mounted) {
            setAccent(name);
            try {
              await AsyncStorage.setItem(ACCENT_STORAGE_KEY, name);
            } catch {
              // ignore
            }
          }
        }
      } catch (e) {
        // keep default
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  // derived active mode
  const activeMode: "light" | "dark" = useMemo(
    () => (mode === "system" ? systemScheme : mode),
    [mode, systemScheme]
  );

  // pick accent colors for the active mode
  const accentColors =
    (accentThemes[accent] && accentThemes[accent][activeMode]) || {};

  const theme = useMemo(() => {
    const base = activeMode === "dark" ? darkTheme : lightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        ...accentColors,
      },
    };
  }, [activeMode, accentColors]);

  const setMode = async (m: Mode) => {
    setModeState(m);
    try {
      await AsyncStorage.setItem(MODE_STORAGE_KEY, m);
      await Updates.reloadAsync(); // reload the app to fully support the new mode
    } catch (e) {
      console.warn("failed to persist/reload theme mode", e);
    }
  };

  const value = useMemo(
    () => ({
      mode,
      setMode,
      accent,
      theme,
    }),
    [mode, accent, theme]
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

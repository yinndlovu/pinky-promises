export const accentThemes = {
  default: {
    light: {
      primary: "#f363a8ff",
      primaryMuted: "#db8bb0ff",
      accent: "#f363a8ff",
      actionButton: "rgba(238, 134, 184, 0.93)",
    },
    dark: {
      primary: "#e03487",
      primaryMuted: "#a0225c",
      accent: "#e03487",
      actionButton: "rgba(194, 58, 124, 0.3)",
    },
  },
  green: {
    light: {
      primary: "#30d33dff",
      primaryMuted: "#81da89ff",
      accent: "#30d33dff",
    },
    dark: {
      primary: "#1ea52aff",
      primaryMuted: "#437747ff",
      accent: "#1ea52aff",
    },
  },
  rose: {
    light: {
      primary: "#ff4fa3",
      primaryMuted: "#ff8ac6",
      accent: "#ff4fa3",
    },
    dark: {
      primary: "#ff2e88",
      primaryMuted: "#8d3060ff",
      accent: "#ff2e88",
    },
  },
  blue: {
    light: {
      primary: "#54a7ffff",
      primaryMuted: "#97cbfcff",
      accent: "#54a7ffff",
    },
    dark: {
      primary: "#2e88ff",
      primaryMuted: "#1b4872ff",
      accent: "#2e88ff",
    },
  },
  gray: {
    light: {
      primary: "#7a7a7a",
      primaryMuted: "#9e9e9e",
      accent: "#7a7a7a",
    },
    dark: {
      primary: "#555555",
      primaryMuted: "#524f4fff",
      accent: "#555555",
    },
  },
  red: {
    light: {
      primary: "#ee3f3fff",
      primaryMuted: "#db7272ff",
      accent: "#ee3f3fff",
    },
    dark: {
      primary: "#f31010ff",
      primaryMuted: "#a03737ff",
      accent: "#f31010ff",
    },
  },
  purple: {
    light: {
      primary: "#b550f8ff",
      primaryMuted: "#d392ffff",
      accent: "#b550f8ff",
    },
    dark: {
      primary: "#8d00ebff",
      primaryMuted: "#57088bff",
      accent: "#8d00ebff",
    },
  },
};

export type AccentThemeName = keyof typeof accentThemes;

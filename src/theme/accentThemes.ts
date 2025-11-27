export const accentThemes = {
  default: {
    primary: "#f363a8ff",
    primaryMuted: "#db8bb0ff",
    accent: "#e03487",
  },
  birthday: {
    primary: "#22c030ff",
    primaryMuted: "#81da89ff",
    accent: "#1fa72aff",
  },
  love: {
    primary: "#ff4fa3",
    primaryMuted: "#ff8ac6",
    accent: "#ff2e88",
  },
  calm: {
    primary: "#4fa3ff",
    primaryMuted: "#8ac6ff",
    accent: "#2e88ff",
  },
  sad: {
    primary: "#7a7a7a",
    primaryMuted: "#9e9e9e",
    accent: "#555555",
  },
  christmas: {
    primary: "#ee3f3fff",
    primaryMuted: "#db7272ff",
    accent: "#f31010ff",
  },
  valentine: {
    primary: "#ee3f3fff",
    primaryMuted: "#db7272ff",
    accent: "#f31010ff",
  },
};

export type AccentThemeName = keyof typeof accentThemes;

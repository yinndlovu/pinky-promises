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
      actionButton: "rgba(135, 241, 153, 0.93)",
    },
    dark: {
      primary: "#198322ff",
      primaryMuted: "#385a3bff",
      accent: "#198322ff",
      actionButton: "rgba(33, 163, 44, 0.3)",
    },
  },
  rose: {
    light: {
      primary: "#ff4fa3",
      primaryMuted: "#ff8ac6",
      accent: "#ff4fa3",
      actionButton: "rgba(238, 134, 184, 0.93)",
    },
    dark: {
      primary: "#ff2e88",
      primaryMuted: "#8d3060ff",
      accent: "#ff2e88",
      actionButton: "rgba(194, 58, 124, 0.3)",
    },
  },
  blue: {
    light: {
      primary: "#54a7ffff",
      primaryMuted: "#a6d4ffff",
      accent: "#54a7ffff",
      actionButton: "rgba(108, 184, 255, 0.93)",
    },
    dark: {
      primary: "#2e88ff",
      primaryMuted: "#1b4872ff",
      accent: "#2e88ff",
      actionButton: "rgba(25, 93, 182, 0.47)",
    },
  },
  gray: {
    light: {
      primary: "#a7a7a7ff",
      primaryMuted: "#707070ff",
      accent: "#a7a7a7ff",
      actionButton: "rgba(206, 206, 206, 0.93)",
    },
    dark: {
      primary: "#6e6e6eff",
      primaryMuted: "#524f4fff",
      accent: "#6e6e6eff",
      actionButton: "rgba(133, 133, 133, 0.45)",
    },
  },
  red: {
    light: {
      primary: "#ff3535ff",
      primaryMuted: "#db7272ff",
      accent: "#ff3535ff",
      actionButton: "rgba(255, 84, 84, 0.93)",
    },
    dark: {
      primary: "#f31010ff",
      primaryMuted: "#a03737ff",
      accent: "#f31010ff",
      actionButton: "rgba(226, 25, 25, 0.45)",
    },
  },
  purple: {
    light: {
      primary: "#b95ef5ff",
      primaryMuted: "#dfafffff",
      accent: "#b95ef5ff",
      actionButton: "rgba(199, 131, 255, 0.93)",
    },
    dark: {
      primary: "#8d00ebff",
      primaryMuted: "#57088bff",
      accent: "#8d00ebff",
      actionButton: "rgba(142, 30, 218, 0.45)",
    },
  },
};

export type AccentThemeName = keyof typeof accentThemes;

export const CATEGORY_ID_TO_KEY: Record<number, string> = {
  9: "general",
  10: "books",
  11: "film",
  12: "music",
  15: "videogames",
  16: "boardgames",
  17: "science",
  18: "computers",
  19: "math",
  20: "mythology",
  21: "sports",
  22: "geography",
  23: "history",
  25: "art",
  26: "celebrities",
  27: "animals",
  28: "vehicles",
  29: "comics",
  30: "gadgets",
  31: "anime",
  32: "cartoons",
};

export const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  videogames: "Video games",
  boardgames: "Board games",
  general: "General knowledge",
};

export const categories = Object.entries(CATEGORY_ID_TO_KEY).map(
  ([id, key]) => ({
    id: parseInt(id),
    name:
      DISPLAY_NAME_OVERRIDES[key] || key.charAt(0).toUpperCase() + key.slice(1),
  })
);

export const TRIVIA_TIMER = 15;

export const EMOJI_REACTIONS = ["😭", "😂", "😲", "😠", "🤍"];

export const FALLBACK_AVATAR = require("../../../assets/default-avatar-two.png");

export const TRIVIA_COLORS = {
  background: "#23243a",
  card: "#2a2b44",
  highlight: "#e03487",
  success: "#4caf50",
  error: "#f44336",
  warning: "#ffc107",
};

export const NAV_ITEMS = [
  { name: "Home", icon: "home" as const },
  { name: "Presents", icon: "gift" as const },
  { name: "Ours", icon: "heart" as const },
  { name: "Profile", icon: "user" as const },
];

export type NavItem = (typeof NAV_ITEMS)[number]["name"];

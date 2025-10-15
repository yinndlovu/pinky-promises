export const notificationsData = [
  {
    id: "1",
    title: "New Message",
    message: "Hey — I left you a cute message!",
    date: new Date().toISOString(),
    seen: false,
  },
  {
    id: "2",
    title: "Daily Check-in",
    message: "Don't forget to say hi today 💕",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    seen: false,
  },
  {
    id: "3",
    title: "Memory Saved",
    message: "You saved a sweet moment yesterday.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    seen: true,
  },
  {
    id: "4",
    title: "Game Invite",
    message: "Your partner invited you to play.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    seen: false,
  },
  {
    id: "5",
    title: "Reminder",
    message: "Anniversary coming up soon.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    seen: true,
  },
  {
    id: "6",
    title: "App Update",
    message: "A small update improved stability.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    seen: true,
  },
];

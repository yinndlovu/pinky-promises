export interface Game {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export const GAMES: Game[] = [
  {
    id: "trivia",
    name: "Trivia",
    description: "Challenge your partner with fun trivia questions",
    icon: "comments",
  },
];

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
  {
    id: "wordPuzzle",
    name: "Word Puzzle",
    description: "Solve word puzzles together",
    icon: "puzzle-piece",
  },
  {
    id: "memoryMatch",
    name: "Memory Match",
    description: "Test your memory with matching cards",
    icon: "check-to-slot",
  },
];

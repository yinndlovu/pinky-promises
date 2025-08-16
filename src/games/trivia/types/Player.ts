export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  status: "correct" | "wrong" | "unanswered" | null;
  socketId?: string;
}

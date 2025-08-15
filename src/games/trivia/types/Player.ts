export type Player = {
  id: number;
  name: string;
  score: number;
  avatar: string;
  status: "correct" | "wrong" | "unanswered" | null;
};

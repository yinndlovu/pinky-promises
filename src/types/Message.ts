export type Message = {
  id: string;
  message?: string;
  seen?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

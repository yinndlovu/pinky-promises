export type MessageType = "sweet" | "vent";

export interface Message {
  id: string;
  content: string;
  date: string;
  viewed: boolean;
  type: MessageType;
  sender: "me" | "partner";
  receiver: "me" | "partner";
}

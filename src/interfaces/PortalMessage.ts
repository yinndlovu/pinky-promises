import { Message } from "../types/Message";

export interface VentMessageProps {
  sent: Message[];
  onLongPress: (msg: Message) => void;
  onAdd: () => void;
  onViewMessage: (msg: Message) => void;
  lastUnseen?: Message | null;
}


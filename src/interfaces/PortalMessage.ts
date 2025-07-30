import { Message } from "../types/Message";

export interface VentMessageProps {
  sent: Message[];
  received: Message[];
  onLongPress: (msg: Message) => void;
  onAdd: () => void;
  onViewMessage: (msg: Message) => void;
  lastUnseen?: Message | null;
}

export interface SweetMessageProps {
  sent: Message[];
  received: Message[];
  onLongPress: (msg: Message) => void;
  onViewAllSent: () => void;
  onViewAllReceived: () => void;
  onAdd: () => void;
  onViewMessage: (msg: Message) => void;
  lastUnseen?: Message | null;
}

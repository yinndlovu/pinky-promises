export interface StoredMessage {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface MessageStorageProps {
  name: string;
  messages: StoredMessage[];
  onAdd: () => void;
  onLongPress: (msg: StoredMessage) => void;
  onPress?: (msg: StoredMessage) => void;
}

export interface PartnerMessageStorageProps {
  name: string;
  messages: StoredMessage[];
  onPress?: (msg: StoredMessage) => void;
}

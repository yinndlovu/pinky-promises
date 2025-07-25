// content
import React from "react";

// content
import MessageCard from "./MessageCard";

// internal
import { Message } from "../../../types/Message";

interface Props {
  messages: Message[];
  onLongPress: (msg: Message) => void;
  onPress?: (msg: Message) => void;
}

export default function MessageList({ messages, onLongPress, onPress }: Props) {
  return (
    <>
      {messages.map((item) => (
        <MessageCard
          key={item.id}
          message={item}
          onLongPress={onLongPress}
          onPress={onPress}
        />
      ))}
    </>
  );
}

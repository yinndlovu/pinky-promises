import React from "react";
import { FlatList } from "react-native";
import { Message } from "../../../types/types";
import MessageCard from "./MessageCard";

interface Props {
  messages: Message[];
  onLongPress: (msg: Message) => void;
  onPress?: (msg: Message) => void;
}

export default function MessageList({ messages, onLongPress, onPress }: Props) {
  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => (
        <MessageCard
          message={item}
          onLongPress={onLongPress}
          onPress={onPress}
        />
      )}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
}

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

type User = {
  id: string;
  name: string;
  username: string;
  isPartner?: boolean;
};

type UserListItemProps = {
  user: User;
  profilePicture?: string;
  onPress: (user: User) => void;
};

export default function UserListItem({
  user,
  profilePicture,
  onPress,
}: UserListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(user)}>
      <Image
        source={
          profilePicture
            ? { uri: profilePicture }
            : require("../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  username: {
    color: "#b0b3c6",
    fontSize: 14,
  },
});

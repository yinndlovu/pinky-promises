// external
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from 'expo-image';

// internal
import { buildCachedImageUrl } from '../../utils/cache/imageCacheUtils';

// types
type User = {
  id: string;
  name: string;
  username: string;
  isPartner?: boolean;
};

type ProfilePictureInfo = {
  uri: string;
  updatedAt: Date;
};

type UserListItemProps = {
  user: User;
  profilePicture?: ProfilePictureInfo;
  onPress: (user: User) => void;
};

export default function UserListItem({
  user,
  profilePicture,
  onPress,
}: UserListItemProps) {

  // render user profile picture
  const renderProfileImage = () => {
    if (profilePicture) {
      const cachedImageUrl = buildCachedImageUrl(user.id, profilePicture.updatedAt);
      return (
        <Image
          source={cachedImageUrl}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      );
    }
    
    return (
      <Image
        source={require("../../assets/default-avatar-two.png")}
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(user)}>
      {renderProfileImage()}
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

// external
import { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";

// internal
import { buildCachedImageUrl } from "../../utils/cache/imageCacheUtils";
import { useTheme } from "../../theme/ThemeContext";

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
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // render user profile picture
  const renderProfileImage = () => {
    if (profilePicture && user) {
      const timestamp = Math.floor(
        new Date(profilePicture.updatedAt).getTime() / 1000
      );

      const cachedImageUrl = buildCachedImageUrl(user.id, timestamp);
      return (
        <Image
          source={cachedImageUrl}
          style={styles.avatar}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
      );
    }

    return (
      <Image
        source={require("../../assets/default-avatar-two.png")}
        style={styles.avatar}
        contentFit="cover"
        cachePolicy="disk"
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

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
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
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    username: {
      color: theme.colors.muted,
      fontSize: 14,
    },
  });

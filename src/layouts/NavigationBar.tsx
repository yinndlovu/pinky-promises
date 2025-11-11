// external
import { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import type {
  NavigationHelpers,
  ParamListBase,
} from "@react-navigation/native";
import type { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

// internal
import { buildCachedImageUrl } from "../utils/cache/imageCacheUtils";
import { NavItem, NAV_ITEMS } from "./NavItem";
import { useAuth } from "../contexts/AuthContext";
import useToken from "../hooks/useToken";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { useGift } from "../hooks/useGift";
import AvatarSkeleton from "../components/skeletons/AvatarSkeleton";
import { useTheme } from "../theme/ThemeContext";

// types
type Props = {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  currentRoute: NavItem;
};

export default function NavigationBar({ navigation, currentRoute }: Props) {
  // variables
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // colors
  const ACTIVE_COLOR = theme.colors.primary;
  const INACTIVE_COLOR = theme.colors.muted;

  // data
  const { data: gift } = useGift(user?.id, token);
  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchUserAvatar,
  } = useProfilePicture(user?.id, token);

  // use states
  const [failed, setFailed] = useState(false);
  const [avatarFetched, setAvatarFetched] = useState(false);

  // use effects
  useEffect(() => {
    if (token) {
      Promise.resolve(fetchUserAvatar()).finally(() => setAvatarFetched(true));
    }
  }, [token]);

  // helpers
  const renderProfileIcon = () => {
    if (!avatarFetched) {
      return <AvatarSkeleton style={styles.avatar} />;
    }

    if (avatarUri && profilePicUpdatedAt && user?.id) {
      const timestamp = Math.floor(
        new Date(profilePicUpdatedAt).getTime() / 1000
      );
      const cachedImageUrl = buildCachedImageUrl(
        user?.id.toString(),
        timestamp
      );

      return (
        <View style={styles.avatarContainer}>
          <Image
            source={
              failed
                ? require("../assets/default-avatar-two.png")
                : { uri: cachedImageUrl }
            }
            style={[
              styles.avatar,
              {
                borderColor:
                  currentRoute === "Profile" ? ACTIVE_COLOR : INACTIVE_COLOR,
              },
            ]}
            cachePolicy="disk"
            contentFit="cover"
            transition={200}
            onError={() => setFailed(true)}
          />
        </View>
      );
    }

    if (!avatarUri) {
      return (
        <Image
          source={require("../assets/default-avatar-two.png")}
          style={[
            styles.avatar,
            {
              borderColor:
                currentRoute === "Profile" ? ACTIVE_COLOR : INACTIVE_COLOR,
            },
          ]}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
      );
    }

    return (
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require("../assets/default-avatar-two.png")
        }
        style={[
          styles.avatar,
          {
            borderColor:
              currentRoute === "Profile" ? ACTIVE_COLOR : INACTIVE_COLOR,
          },
        ]}
        contentFit="cover"
        cachePolicy="disk"
        transition={200}
        onError={() => setFailed(true)}
      />
    );
  };

  // check if there is an unclaimed gift
  const hasUnclaimedGift = !!gift;

  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#23243a" }}>
      <View style={styles.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <Pressable
              key={item.name}
              onPress={() => {
                const isActive = currentRoute === item.name;

                if (!isActive) {
                  navigation.navigate(item.name);
                  return;
                }

                const startScreens: Record<string, string> = {
                  Home: "HomeScreen",
                  Presents: "PresentsScreen",
                  Ours: "OursScreen",
                  Profile: "ProfileScreen",
                };

                const start = startScreens[item.name];
                if (start) {
                  navigation.navigate(item.name, { screen: start });
                }
              }}
              android_ripple={{
                color: theme.colors.ripple,
                borderless: true,
                radius: 30,
              }}
              style={({ pressed }) => [
                styles.tab,
                {
                  opacity: pressed ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              {item.name === "Profile" ? (
                renderProfileIcon()
              ) : (
                <View>
                  <Feather
                    name={item.icon}
                    size={26}
                    color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                  {item.name === "Presents" && hasUnclaimedGift && (
                    <View
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#ff1414ff",
                      }}
                    />
                  )}
                </View>
              )}
              <Text
                style={[
                  styles.label,
                  { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.surfaceAlt,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: 30,
      overflow: "hidden",
      padding: 10,
      justifyContent: "center",
    },
    label: {
      fontSize: 12,
      marginTop: 2,
      fontWeight: "bold",
    },
    avatarContainer: {
      width: 26,
      height: 26,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
    },
  });

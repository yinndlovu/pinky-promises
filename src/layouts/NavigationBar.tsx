// external
import React, { useState, useEffect } from "react";
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

// types
type Props = {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  currentRoute: NavItem;
};

const ACTIVE_COLOR = "#e03487";
const INACTIVE_COLOR = "#b0b3c6";

export default function NavigationBar({ navigation, currentRoute }: Props) {
  // variables
  const { user } = useAuth();
  const token = useToken();

  const { data: gift } = useGift(user?.id, token);

  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchUserAvatar,
  } = useProfilePicture(user?.id, token);

  // use states
  const [failed, setFailed] = useState(false);

  // use effects
  useEffect(() => {
    if (token) {
      fetchUserAvatar();
    }
  }, [token]);

  const renderProfileIcon = () => {
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

    return null;
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
              onPress={() => navigation.navigate(item.name)}
              android_ripple={{
                color: "rgba(167, 72, 130, 0.3)",
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#23243a",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#23243a",
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

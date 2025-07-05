import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import type {
  NavigationHelpers,
  ParamListBase,
} from "@react-navigation/native";
import type { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../configuration/config";
import { encode } from 'base64-arraybuffer';

const NAV_ITEMS = [
  { name: "Home", icon: "home" as const },
  { name: "Presents", icon: "gift" as const },
  { name: "Ours", icon: "heart" as const },
  { name: "Profile", icon: "user" as const },
];

type NavItem = (typeof NAV_ITEMS)[number]["name"];

type Props = {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  currentRoute: NavItem;
};

const ACTIVE_COLOR = "#e03487";
const INACTIVE_COLOR = "#b0b3c6";

export default function NavigationBar({ navigation, currentRoute }: Props) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAvatar();
  }, []);

  const fetchUserAvatar = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const userResponse = await axios.get(
        `${BASE_URL}/api/profile/get-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userId = userResponse.data.user.id;

      const pictureResponse = await axios.get(
        `${BASE_URL}/api/profile/get-profile-picture/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer"
        }
      );

      const mime = pictureResponse.headers["content-type"] || "image/jpeg";
      const base64 = `data:${mime};base64,${encode(pictureResponse.data)}`;

      setAvatarUri(base64);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const renderProfileIcon = () => {
    if (loading) {
      return (
        <View style={styles.avatarContainer}>
          <ActivityIndicator size={16} color={currentRoute === "Profile" ? ACTIVE_COLOR : INACTIVE_COLOR} />
        </View>
      );
    }

    if (avatarUri) {
      return (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={[
              styles.avatar,
              { borderColor: currentRoute === "Profile" ? ACTIVE_COLOR : INACTIVE_COLOR }
            ]}
          />
        </View>
      );
    }

    return (
      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/default-avatar-two.png")}
          style={[
            styles.avatar,
            { borderColor: currentRoute === "Profile" ? ACTIVE_COLOR : INACTIVE_COLOR }
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#23243a" }}>
      <View style={styles.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.tab}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.7}
            >
              {item.name === "Profile" ? (
                renderProfileIcon()
              ) : (
                <Feather
                  name={item.icon}
                  size={26}
                  color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              )}
              <Text
                style={[
                  styles.label,
                  { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
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

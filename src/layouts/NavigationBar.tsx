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

// internal
import { NavItem, NAV_ITEMS } from "./NavItem";

// internal (hooks)
import { useAuth } from "../contexts/AuthContext";
import useToken from "../hooks/useToken";
import { useProfilePicture } from "../hooks/useProfilePicture";
import { usePeriod } from "../hooks/usePeriod";
import { useTheme } from "../theme/ThemeContext";
import { usePeriodSelector } from "../hooks/usePeriodSelector";

// content
import ProfileImage from "../components/common/ProfileImage";

// types
type Props = {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  currentRoute: NavItem;
};

export default function NavigationBar({ navigation, currentRoute }: Props) {
  // hook variables
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // colors
  const ACTIVE_COLOR = theme.colors.primary;
  const INACTIVE_COLOR = theme.colors.muted;

  // fetch data
  const { data: _periodData } = usePeriod(token, user?.id);
  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchUserAvatar,
  } = useProfilePicture(user?.id, token);

  // select data from period selector
  const periodStatus = usePeriodSelector(user?.id, (data) => data?.status);

  // use states
  const [avatarFetched, setAvatarFetched] = useState(false);

  // use effects
  useEffect(() => {
    if (token && user?.id) {
      Promise.resolve(fetchUserAvatar()).finally(() => setAvatarFetched(true));
    }
  }, [token, user?.senderId]);

  // check if currently on period or period is late
  const showPeriodIndicator =
    periodStatus?.status === "on_period" || periodStatus?.status === "late";

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ backgroundColor: theme.colors.background }}
    >
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
                  Period: "PeriodScreen",
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
                <ProfileImage
                  avatarUri={avatarUri}
                  userId={user?.id}
                  avatarFetched={avatarFetched}
                  updatedAt={profilePicUpdatedAt}
                  style={[
                    styles.avatar,
                    {
                      borderColor:
                        currentRoute === "Profile"
                          ? ACTIVE_COLOR
                          : INACTIVE_COLOR,
                    },
                  ]}
                />
              ) : (
                <View>
                  <Feather
                    name={item.icon}
                    size={26}
                    color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                  />
                  {item.name === "Period" && showPeriodIndicator && (
                    <View
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          periodStatus?.status === "late"
                            ? "#ff6b6b"
                            : "#ff6b9d",
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

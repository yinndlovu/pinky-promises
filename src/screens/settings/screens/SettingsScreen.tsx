// external
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
  ToastAndroid,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";

// internal
import { useAuth } from "../../../contexts/AuthContext";
import LogoutModal from "../../../components/modals/selection/LogoutModal";
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { useTrackingStatus, useStartTracking } from "../../../hooks/useStreak";

// content
import ThemePickerModal from "../../../components/modals/selection/ThemePickerModal";
import StartTrackingModal from "../../../components/modals/streak/StartTrackingModal";
import { SocialMediaPlatform } from "../../../types/Streak";

// types
type SettingsScreenProps = StackScreenProps<any, any>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
  route,
}) => {
  // use states
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // variables
  const { theme, mode, setMode } = useTheme() as any;
  const { logout, user } = useAuth();
  const token = useToken();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // streak hooks
  const { data: trackingStatus, refetch: refetchTracking } = useTrackingStatus(
    token,
    user?.id
  );
  const startTrackingMutation = useStartTracking(token);

  // handlers
  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    if (Platform.OS === "android") {
      ToastAndroid.show("Successfully logged out", ToastAndroid.SHORT);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const handleStartTracking = async (platforms: SocialMediaPlatform[]) => {
    try {
      await startTrackingMutation.mutateAsync(platforms);
      setShowStreakModal(false);
      setSuccess(`Now tracking streaks for ${platforms.join(" and ")}`);
      refetchTracking();
    } catch (error: any) {
      setSuccess(error?.response?.data?.error || "Failed to start tracking");
    }
  };

  const handleStreakPress = () => {
    if (trackingStatus?.isTracking) {
      // Navigate to streak screen if already tracking
      navigation.navigate("StreakScreen");
    } else {
      // Show modal to start tracking
      setShowStreakModal(true);
    }
  };

  // use effects
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (route.params?.emailChanged) {
        setSuccess("Email address updated");
        navigation.setParams({ emailChanged: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // options
  const settingsOptions = [
    {
      label: "Account",
      icon: "user",
      onPress: () => navigation.navigate("AccountScreen"),
    },
    {
      label: "Notifications",
      icon: "bell",
      onPress: () => navigation.navigate("NotificationsScreen"),
    },
    {
      label: "About",
      icon: "info",
      onPress: () => navigation.navigate("AboutScreen"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          {settingsOptions.map((option) => (
            <Pressable
              key={option.label}
              style={styles.actionRow}
              onPress={option.onPress}
              android_ripple={{ color: theme.colors.ripple }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Feather
                  name={option.icon as any}
                  size={20}
                  color={theme.colors.accent}
                  style={styles.optionIcon}
                />
                <Text style={styles.actionText}>{option.label}</Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.colors.text}
              />
            </Pressable>
          ))}

          {/* Streak Tracking Option */}
          <Pressable
            style={styles.actionRow}
            onPress={handleStreakPress}
            android_ripple={{ color: theme.colors.ripple }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Feather
                name="zap"
                size={20}
                color={theme.colors.accent}
                style={styles.optionIcon}
              />
              <Text style={styles.actionText}>Streak Tracking</Text>
            </View>
            {trackingStatus?.isTracking && (
              <View style={styles.trackingBadge}>
                <Feather name="check" size={12} color={theme.colors.text} />
                <Text style={styles.trackingBadgeText}>Active</Text>
              </View>
            )}
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.text}
              style={{ marginLeft: 8 }}
            />
          </Pressable>

          <Pressable
            style={styles.actionRow}
            onPress={() => setShowThemeModal(true)}
            android_ripple={{ color: theme.colors.ripple }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Feather
                name="sun"
                size={20}
                color={theme.colors.accent}
                style={styles.optionIcon}
              />
              <Text style={styles.actionText}>Theme</Text>
            </View>
            <Text
              style={[
                styles.actionText,
                { color: theme.colors.muted, marginRight: 8 },
              ]}
            >
              {mode === "system"
                ? "System"
                : mode === "dark"
                ? "Dark"
                : "Light"}
            </Text>
            <Feather name="chevron-right" size={20} color={theme.colors.text} />
          </Pressable>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Feather
            name="log-out"
            size={20}
            color={theme.colors.text}
            style={styles.optionIcon}
          />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
      {showSuccess && (
        <View style={[styles.toast, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.toastText}>{success}</Text>
        </View>
      )}

      <ThemePickerModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        value={mode}
        onChange={(v) => {
          setMode(v);
          setShowThemeModal(false);
        }}
      />

      <StartTrackingModal
        visible={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        onStart={handleStartTracking}
        loading={startTrackingMutation.isPending}
        currentlyTracking={trackingStatus?.platforms || []}
      />

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 32,
      alignItems: "stretch",
      backgroundColor: theme.colors.background,
      minHeight: "100%",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 10,
      marginLeft: 6,
    },
    actionRow: {
      backgroundColor: theme.colors.surfaceAlt,
      marginBottom: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    actionText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    optionIcon: {
      marginRight: 16,
    },
    trackingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    trackingBadgeText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignSelf: "center",
      marginTop: 8,
    },
    logoutText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 10,
      letterSpacing: 1,
    },
    toast: {
      position: "absolute",
      top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      zIndex: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    toastText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default SettingsScreen;

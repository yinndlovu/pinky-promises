import React, { useLayoutEffect } from "react";
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import axios from "axios";
import { BASE_URL } from "../../configuration/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { encode } from 'base64-arraybuffer';

type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [partner, setPartner] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [showError, setShowError] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  React.useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get(
          `${BASE_URL}/api/partnership/get-partner`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const partnerData = response.data.partner;
        setPartner(partnerData);

        const partnerId = partnerData.id;

        try {
          const pictureResponse = await axios.get(
            `${BASE_URL}/api/profile/get-profile-picture/${partnerId}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "arraybuffer"
          });

          const mime = pictureResponse.headers["content-type"] || "image/jpeg";
          const base64 = `data:${mime};base64,${encode(pictureResponse.data)}`;

          setAvatarUri(base64);
        } catch (picErr: any) {
          if (![404, 500].includes(picErr.response?.status)) {
            setError(picErr.response?.data?.error || picErr.message);
          }
        }
      } catch (err) {
        setError("Failed to fetch partner data");
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={{ marginLeft: 20 }}
        >
          <Feather name="search" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={{ marginRight: 20 }}
        >
          <Feather name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerShown: true,
      title: "",
      headerTransparent: true,
      headerTintColor: "#fff",
      headerStyle: {
        backgroundColor: "transparent",
      },
      headerShadowVisible: false,
    });
  }, [navigation]);

  {
    showError && (
      <View style={styles.toast}>
        <Text style={styles.toastText}>{error}</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
        >
          <Text style={styles.headerTitle}>Overview</Text>
          <Text style={styles.partnerLabel}>PARTNER</Text>
          <View style={[styles.profileCard, !isActive && styles.profileCardInactive]}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    avatarUri ? { uri: avatarUri }
                      : require("../../assets/default-avatar-two.png")
                  }
                  style={styles.avatar}
                />
              </View>
              <View style={styles.infoWrapper}>
                <Text style={styles.name}>{partner?.name || "No partner"}</Text>
                <Text style={styles.username}>@{partner?.username || ""}</Text>
                <Text style={styles.bio}>{partner?.bio || ""}</Text>
                {error && <Text style={{ color: "red" }}>{error}</Text>}
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>Status: Home</Text>
              <Text style={styles.statusText}>Mood: Happy</Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <BlurView intensity={50} tint="dark" style={styles.blurButton}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>LIPS</Text>
              </TouchableOpacity>
            </BlurView>
            <BlurView intensity={50} tint="dark" style={styles.blurButton}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>EMB</Text>
              </TouchableOpacity>
            </BlurView>
            <BlurView intensity={50} tint="dark" style={styles.blurButton}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>MORE...</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
          <View style={styles.upcomingContainer}>
            <Text style={styles.upcomingLabel}>UPCOMING</Text>
            <View style={styles.eventCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.eventName}>No upcoming events</Text>
                <Text style={styles.eventTimeLeft}> 5 days left</Text>
              </View>
              <Text style={styles.eventDescription}>
                Stay tuned for more exciting events coming soon!
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    paddingTop: 26,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    alignSelf: "center",
  },
  partnerLabel: {
    fontSize: 14,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginLeft: 16,
    marginTop: 36,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  profileCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: "100%",
  },
  profileCardInactive: {
    opacity: 0.6,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    alignSelf: "flex-start",
    marginBottom: 16,
    marginRight: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e03487",
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
    marginLeft: 4
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  statusText: {
    fontSize: 13,
    color: "#b0b3c6",
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: "rgba(194, 58, 124, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  blurButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  upcomingContainer: {
    marginTop: 24,
    width: "100%",
  },
  upcomingLabel: {
    fontSize: 14,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 16,
  },
  eventCard: {
    backgroundColor: "#23243a",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1.5,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  eventTimeLeft: {
    fontSize: 14,
    color: "#b0b3c6",
    marginLeft: 8,
    fontWeight: "600",
    opacity: 0.7,
  },
  eventDescription: {
    fontSize: 15,
    color: "#b0b3c6",
    marginTop: 2,
    opacity: 0.85,
  },
  toast: {
    position: "absolute",
    // top: 40
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HomeScreen;

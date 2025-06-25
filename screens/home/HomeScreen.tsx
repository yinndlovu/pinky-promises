import React, { useLayoutEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import axios from "axios";
import { BASE_URL } from "../../configuration/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const dummyUser = {
  bio: "Lover of pinky promises and surprises. 🎁",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [partner, setPartner] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get(`${BASE_URL}/api/partnership/get-partner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPartner(response.data.partner);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch partner data");
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.partnerLabel}>PARTNER</Text>
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: dummyUser.avatar }} style={styles.avatar} />
          </View>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{partner?.name || 'No partner'}</Text>
            <Text style={styles.username}>@{partner?.username || ''}</Text>
            <Text style={styles.bio}>{dummyUser.bio}</Text>
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
          </View>
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
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={styles.eventName}>No upcoming events</Text>
            <Text style={styles.eventTimeLeft}>    5 days left</Text>
          </View>
          <Text style={styles.eventDescription}>
            Stay tuned for more exciting events coming soon!
          </Text>
        </View>
      </View>
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
  partnerLabel: {
    fontSize: 14,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginLeft: 16,
    marginTop: 70,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  profileCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 20,
    padding: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: "100%",
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
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
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
    paddingHorizontal: 8,
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
});

export default HomeScreen;

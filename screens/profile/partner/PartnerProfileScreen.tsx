import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../configuration/config";
import { encode } from "base64-arraybuffer";
import PartnerStatusMood from "./PartnerStatusMood";

const fallbackAvatar = require("../../../assets/default-avatar-two.png");

const PartnerProfileScreen = () => {
  const [partner, setPartner] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
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

        try {
          const pictureResponse = await axios.get(
            `${BASE_URL}/api/profile/get-profile-picture/${partnerData.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "arraybuffer",
            }
          );
          const mime = pictureResponse.headers["content-type"] || "image/jpeg";
          const base64 = `data:${mime};base64,${encode(pictureResponse.data)}`;

          setAvatarUri(base64);
        } catch (picErr: any) {
          setAvatarUri(null);
        }
      } catch (err) {
        setPartner(null);
        setAvatarUri(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${BASE_URL}/api/profile/get-profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCurrentUserName(response.data.user.name);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    fetchPartner();
    fetchCurrentUser();
  }, []);

  const name = partner?.name || "User";
  const username = partner?.username || "user";
  const bio = partner?.bio || "";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
      </View>
    );
  }

  if (!partner) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
          You have no partner
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Partner</Text>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={avatarUri ? { uri: avatarUri } : fallbackAvatar}
              style={styles.avatar}
            />
          </View>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{name}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
            {bio ? <Text style={styles.bio}>{bio}</Text> : null}
          </View>
        </View>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color="#5ad1e6" size="large" />
          </View>
        )}
        <View style={styles.divider} />

        <View style={styles.partnerRow}>
          <Text style={styles.partnerText}>
            Partner:{" "}
            <Text style={styles.partnerName}>
              {currentUserName || "You"}
            </Text>
          </Text>
        </View>

        <PartnerStatusMood partnerId={partner.id} partnerName={name} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    paddingHorizontal: 16,
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 36,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    marginRight: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#e03487",
    backgroundColor: "#444",
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
    color: "#5ad1e6",
    marginBottom: 8,
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#393a4a",
    marginVertical: 24,
    opacity: 1,
  },
  partnerRow: {
    marginBottom: 20,
    marginLeft: 2,
    alignItems: "center",
  },
  partnerText: {
    color: "#b0b3c6",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  partnerName: {
    color: "rgb(155, 158, 180)",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PartnerProfileScreen;

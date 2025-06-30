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

const fallbackAvatar = require("../../../assets/default-avatar-two.png");

const PartnerProfileScreen = () => {
  const [partner, setPartner] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

    fetchPartner();
  }, []);

  const name = partner?.name || "No partner";
  const username = partner?.username || "";
  const bio = partner?.bio || "";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#23243a" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Partner Profile</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 36,
    marginTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5ad1e6",
    letterSpacing: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginHorizontal: 16,
  },
  avatarWrapper: {
    marginRight: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#5ad1e6",
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
    width: "90%",
    height: 1,
    backgroundColor: "#393a4a",
    marginVertical: 24,
    alignSelf: "center",
    opacity: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
});

export default PartnerProfileScreen;

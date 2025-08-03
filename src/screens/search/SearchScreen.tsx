// external
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encode } from "base64-arraybuffer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

// internal
import { searchUsers } from "../../services/api/home/searchService";
import { BASE_URL } from "../../configuration/config";
import { User } from "../../types/User";
import { ProfilePictureInfo } from "../../types/ProfilePicture";

// screen content
import AlertModal from "../../components/modals/output/AlertModal";
import UserListItem from "./UserListItem";

// types
type Props = NativeStackScreenProps<any>;

export default function SearchScreen({ navigation }: Props) {
  // variables
  const insets = useSafeAreaInsets();

  // use states
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [profilePictures, setProfilePictures] = useState<ProfilePictureInfo>(
    {}
  );
  const [isOnline, setIsOnline] = useState(true);

  // use states (modals)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // use effects
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // fetch functions
  const fetchProfilePicture = async (userId: string, token: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/profile/get-profile-picture/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );
      const mime = response.headers["content-type"] || "image/jpeg";
      const base64 = `data:${mime};base64,${encode(response.data)}`;

      const lastModified = response.headers["last-modified"];
      const updatedAt = lastModified ? new Date(lastModified) : new Date();

      return {
        uri: base64,
        updatedAt,
      };
    } catch {
      return null;
    }
  };

  // helpers
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // handlers
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setUsers([]);
      setProfilePictures({});
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        setLoading(false);
        return;
      }

      const results = await searchUsers(token, text);
      setUsers(results);

      const pics: ProfilePictureInfo = {};
      await Promise.all(
        results.map(async (user: User) => {
          const pic = await fetchProfilePicture(user.id, token);
          if (pic) pics[user.id] = pic;
        })
      );
      setProfilePictures(pics);
    } catch (err) {
      setError("Failed to search users");
    }
    setLoading(false);
  };

  const handleUserPress = (user: User) => {
    if (user.isUser) {
      showAlert("This is you!");
    } else if (user.isPartner) {
      navigation.navigate("PartnerProfile", { userId: user.id });
    } else {
      navigation.navigate("UserProfile", { userId: user.id });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a", paddingTop: 0 }}>
      {!isOnline && (
        <View
          style={{
            backgroundColor: "red",
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <TextInput
        style={{
          backgroundColor: "#1b1c2e",
          color: "#fff",
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 12,
          marginHorizontal: 16,
          marginBottom: 12,
          marginTop: 12,
        }}
        placeholder="Search users..."
        placeholderTextColor="#b0b3c6"
        value={query}
        onChangeText={handleSearch}
      />
      {loading && (
        <ActivityIndicator color="#e03487" style={{ marginTop: 20 }} />
      )}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            profilePicture={profilePictures[item.id]}
            onPress={handleUserPress}
          />
        )}
        ListEmptyComponent={
          !loading && query.length > 1 ? (
            <Text
              style={{ color: "#b0b3c6", alignSelf: "center", marginTop: 40 }}
            >
              No users found.
            </Text>
          ) : null
        }
      />

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 60,
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

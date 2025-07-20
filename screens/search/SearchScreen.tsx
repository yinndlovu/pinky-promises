// external
import React, { useState } from "react";
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

// internal
import { searchUsers } from "../../services/searchService";
import { BASE_URL } from "../../configuration/config";

// screen content
import AlertModal from "../../components/modals/AlertModal";
import UserListItem from "./UserListItem";

// types
type Props = NativeStackScreenProps<any>;

type User = {
  id: string;
  name: string;
  username: string;
  isPartner?: boolean;
  isUser?: boolean;
};

type ProfilePictureInfo = {
  [userId: string]: {
    uri: string;
    updatedAt: Date;
  };
};

export default function SearchScreen({ navigation }: Props) {
  // variables
  const insets = useSafeAreaInsets();

  // use states
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePictures, setProfilePictures] = useState<ProfilePictureInfo>(
    {}
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
    setError("");

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Not authenticated");
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
      {error ? (
        <Text style={{ color: "red", alignSelf: "center" }}>{error}</Text>
      ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({});

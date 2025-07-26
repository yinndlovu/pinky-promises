// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { encode } from "base64-arraybuffer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";

// internal
import {
  sendPartnerRequest,
  checkPendingRequest,
  cancelPartnerRequest,
  getIncomingRequest,
  acceptPartnerRequest,
} from "../../../services/partnerService";
import { BASE_URL } from "../../../configuration/config";
import { buildCachedImageUrl } from "../../../utils/imageCacheUtils";

// screen content
import AlertModal from "../../../components/modals/AlertModal";
import styles from "./styles/UserProfileScreen.styles";

// variables
const fallbackAvatar = require("../../../assets/default-avatar-two.png");

// types
type Props = NativeStackScreenProps<any, "UserProfile">;
type RequestStatus = "none" | "pending" | "incoming";

const UserProfileScreen = ({ route, navigation }: Props) => {
  // variables
  const { userId } = route.params as { userId: string };
  const queryClient = useQueryClient();
  // use states
  const [user, setUser] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");
  const [incomingRequestId, setIncomingRequestId] = useState<string | null>(
    null
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );

  // use effects
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get(
          `${BASE_URL}/api/profile/get-user-profile/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userData = response.data.profile;
        setUser(userData);

        try {
          const pictureResponse = await axios.get(
            `${BASE_URL}/api/profile/get-profile-picture/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "arraybuffer",
            }
          );
          const mime = pictureResponse.headers["content-type"] || "image/jpeg";
          const base64 = `data:${mime};base64,${encode(pictureResponse.data)}`;

          setAvatarUri(base64);

          const lastModified = pictureResponse.headers["last-modified"];
          setProfilePicUpdatedAt(
            lastModified ? new Date(lastModified) : new Date()
          );
        } catch (picErr: any) {
          setAvatarUri(null);
        }

        await checkRequestStatus(token);
      } catch (err) {
        setUser(null);
        setAvatarUri(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // handlers
  const handlePartnerAction = async () => {
    setSendingRequest(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        showAlert("Not authenticated");
        return;
      }

      switch (requestStatus) {
        case "pending":
          await cancelPartnerRequest(token, userId);
          setRequestStatus("none");
          showAlert("Partner request cancelled");
          break;

        case "incoming":
          if (incomingRequestId) {
            await acceptPartnerRequest(token, incomingRequestId);
            await queryClient.invalidateQueries({
              queryKey: ["partnerData"],
            });

            setRequestStatus("none");
            setIncomingRequestId(null);

            navigation.replace("PartnerProfile", { userId: userId });
          }
          break;

        case "none":
          await sendPartnerRequest(token, userId);
          setRequestStatus("pending");
          showAlert("Partner request sent");
          break;
      }
    } catch (error: any) {
      showAlert(
        error.response?.data?.error || "Failed to process partner request"
      );
    } finally {
      setSendingRequest(false);
    }
  };

  // helpers
  const renderProfileImage = () => {
    if (avatarUri && profilePicUpdatedAt) {
      const cachedImageUrl = buildCachedImageUrl(userId, profilePicUpdatedAt);
      return (
        <Image
          source={cachedImageUrl}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      );
    }

    return (
      <Image
        source={avatarUri ? avatarUri : fallbackAvatar}
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

  const checkRequestStatus = async (token: string) => {
    try {
      const pendingResponse = await checkPendingRequest(token, userId);

      if (pendingResponse.hasPendingRequest) {
        setRequestStatus("pending");
        return;
      }

      const incomingResponse = await getIncomingRequest(token, userId);

      if (incomingResponse.hasIncomingRequest) {
        setRequestStatus("incoming");
        setIncomingRequestId(incomingResponse.requestId);
        return;
      }

      setRequestStatus("none");
    } catch (err) {
      setRequestStatus("none");
    }
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const getButtonText = () => {
    switch (requestStatus) {
      case "pending":
        return "Cancel request";
      case "incoming":
        return "Accept request";
      case "none":
        return "Add partner";
      default:
        return "Add partner";
    }
  };

  const getButtonStyle = () => {
    switch (requestStatus) {
      case "pending":
        return styles.cancelButton;
      case "incoming":
        return styles.acceptButton;
      case "none":
        return styles.addPartnerButton;
      default:
        return styles.addPartnerButton;
    }
  };

  // declarations
  const name = user?.name || "User";
  const username = user?.username || "user";
  const bio = user?.bio || "";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
          User not found
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
          <Text style={styles.headerTitle}>User</Text>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>{renderProfileImage()}</View>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{name}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
            {bio ? <Text style={styles.bio}>{bio}</Text> : null}
          </View>
        </View>
        <View style={styles.divider} />

        <TouchableOpacity
          style={[
            styles.partnerButton,
            getButtonStyle(),
            sendingRequest && styles.partnerButtonDisabled,
          ]}
          onPress={handlePartnerAction}
          disabled={sendingRequest}
        >
          {sendingRequest ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.partnerButtonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default UserProfileScreen;

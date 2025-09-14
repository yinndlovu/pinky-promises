// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import {
  sendPartnerRequest,
  checkPendingRequest,
  cancelPartnerRequest,
  getIncomingRequest,
  acceptPartnerRequest,
} from "../../../../services/api/profiles/partnerService";
import { buildCachedImageUrl } from "../../../../utils/imageCacheUtils";
import useToken from "../../../../hooks/useToken";
import { useProfilePicture } from "../../../../hooks/useProfilePicture";
import { getUserProfile } from "../../../../services/api/profiles/profileService";

// screen content
import AlertModal from "../../../../components/modals/output/AlertModal";
import styles from "../styles/UserProfileScreen.styles";
import LoadingSpinner from "../../../../components/loading/LoadingSpinner";

// variables
const fallbackAvatar = require("../../../../assets/default-avatar-two.png");

// types
type Props = NativeStackScreenProps<any, "UserProfile">;
type RequestStatus = "none" | "pending" | "incoming";

const UserProfileScreen = ({ route, navigation }: Props) => {
  // variables
  const { userId } = route.params as { userId: string };
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const token = useToken();

  // use states
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");
  const [incomingRequestId, setIncomingRequestId] = useState<string | null>(
    null
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  if (!token) {
    throw new Error("Session expired, please log in again");
  }

  const fetchUser = async () => {
    try {
      const userData = await getUserProfile(userId, token);
      setUser(userData);

      await checkRequestStatus(token);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // use effects
  useEffect(() => {
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // handlers
  const handlePartnerAction = async () => {
    setSendingRequest(true);

    try {
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
              queryKey: ["partnerData", user?.id],
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

  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(userId, token);

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
        <LoadingSpinner showMessage={false} size="medium" />
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

// external
import { useEffect, useState, useMemo } from "react";
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
import { buildCachedImageUrl } from "../../../../utils/cache/imageCacheUtils";

// internal (hooks)
import useToken from "../../../../hooks/useToken";
import { useProfilePicture } from "../../../../hooks/useProfilePicture";
import { useUser } from "../../../../hooks/useProfile";
import { usePartnerRequestStatus } from "../../../../hooks/usePartnerRequestStatus";
import { useTheme } from "../../../../theme/ThemeContext";
import { useAuth } from "../../../../contexts/AuthContext";

// screen content
import AlertModal from "../../../../components/modals/output/AlertModal";
import { createUserProfileStyles } from "../styles/UserProfileScreen.styles";
import LoadingSpinner from "../../../../components/loading/LoadingSpinner";

// variables
const fallbackAvatar = require("../../../../assets/default-avatar-two.png");

// types
type Props = NativeStackScreenProps<any, "UserProfile">;

const UserProfileScreen = ({ route, navigation }: Props) => {
  // param variables
  const { userId } = route.params as { userId: string };

  // hook variables
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createUserProfileStyles(theme), [theme]);
  const { user } = useAuth();

  // use states
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [failed, setFailed] = useState(false);

  // fetch user
  const { data: userData, isLoading: userDataLoading } = useUser(token, userId);

  // hook
  const {
    cancelRequest,
    acceptRequest,
    sendRequest,
    requestStatus,
    incomingRequestId,
    checkRequestStatus,
  } = usePartnerRequestStatus();

  // handlers
  const handlePartnerAction = async () => {
    setSendingRequest(true);

    try {
      switch (requestStatus) {
        case "pending":
          await cancelRequest(token, userId);
          setAlertTitle("Partner request cancelled");
          setAlertMessage("You have cancelled the partner request.");
          setShowSuccessAlert(true);
          break;

        case "incoming":
          if (incomingRequestId) {
            await acceptRequest(token, incomingRequestId);
            await queryClient.invalidateQueries({
              queryKey: ["home", user?.id],
            });
            await queryClient.invalidateQueries({
              queryKey: ["profile", user?.id],
            });

            navigation.replace("PartnerProfile", { userId });
          }
          break;

        case "none":
          await sendRequest(token, userId);
          setAlertTitle("Partner request sent");
          setAlertMessage(
            "You have sent a partner request. Wait for the user to accept it."
          );
          setShowSuccessAlert(true);
          break;
      }
    } catch (error: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        error.response?.data?.error || "Failed to process partner request"
      );
      setShowErrorAlert(true);
    } finally {
      setSendingRequest(false);
    }
  };

  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchUserPicture,
  } = useProfilePicture(userId, token);

  // use effects
  useEffect(() => {
    if (token && userId) {
      fetchUserPicture();
    }
  }, [userId, token]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // helpers
  const renderProfileImage = () => {
    if (avatarUri && profilePicUpdatedAt && userId) {
      const timestamp = Math.floor(
        new Date(profilePicUpdatedAt).getTime() / 1000
      );
      const cachedImageUrl = buildCachedImageUrl(userId, timestamp);

      return (
        <Image
          source={failed ? fallbackAvatar : { uri: cachedImageUrl }}
          style={styles.avatar}
          cachePolicy="disk"
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      );
    }

    return (
      <Image
        source={avatarUri ? { uri: avatarUri } : fallbackAvatar}
        style={styles.avatar}
        cachePolicy="disk"
        contentFit="cover"
        transition={200}
      />
    );
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
  const name = userData?.name || "User";
  const username = userData?.username || "user";
  const bio = userData?.bio || "";

  if (userDataLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text
          style={{ color: theme.colors.text, fontSize: 22, fontWeight: "bold" }}
        >
          User not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
          <Text style={{ color: theme.colors.text, textAlign: "center" }}>
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
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <Text style={styles.partnerButtonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <AlertModal
        visible={showSuccessAlert}
        type="success"
        title={alertTitle}
        message={alertMessage}
        buttonText="Great"
        onClose={() => setShowSuccessAlert(false)}
      />

      <AlertModal
        visible={showErrorAlert}
        type="error"
        title={alertTitle}
        message={alertMessage}
        buttonText="Close"
        onClose={() => setShowErrorAlert(false)}
      />
    </View>
  );
};

export default UserProfileScreen;

// external
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";

// internal
import {
  getReceivedPartnerRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
} from "../../../services/api/profiles/partnerService";
import { buildCachedImageUrl } from "../../../utils/cache/imageCacheUtils";
import { PendingRequest } from "../../../types/Request";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useProfilePicture } from "../../../hooks/useProfilePicture";
import { useTheme } from "../../../theme/ThemeContext";
import { createPendingRequestsStyles } from "../styles/PendingRequestsScreen.styles";

// screen content
import AlertModal from "../../../components/modals/output/AlertModal";

// variables
const fallbackAvatar = require("../../../assets/default-avatar-two.png");

const ProfileImage = ({ userId, token }: { userId: string; token: string }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createPendingRequestsStyles(theme), [theme]);

  // use states
  const [failed, setFailed] = useState(false);

  const { avatarUri, profilePicUpdatedAt, fetchPicture } = useProfilePicture(
    userId,
    token
  );

  // use effects
  useEffect(() => {
    fetchPicture();
  }, [fetchPicture]);

  if (avatarUri && profilePicUpdatedAt) {
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

const PendingRequestsScreen = ({ navigation }: any) => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createPendingRequestsStyles(theme), [theme]);

  // use states
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showInfoAlert, setShowInfoAlert] = useState(false);

  // use states (processing)
  const [processingAccept, setProcessingAccept] = useState<string | null>(null);
  const [processingReject, setProcessingReject] = useState<string | null>(null);

  // use effects
  useEffect(() => {
    if (!token) {
      return;
    }

    (async () => {
      try {
        const requestsData = await getReceivedPartnerRequests(token);
        const list = Array.isArray(requestsData) ? requestsData : [];
        setRequests(list.filter((r: PendingRequest) => r.status === "pending"));
      } catch (err) {
        console.error("failed to fetch requests", err);
      }
    })();
  }, [token]);

  if (!token) {
    return null;
  }

  // handlers
  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    setProcessingAccept(requestId);

    try {
      await acceptPartnerRequest(token, requestId);

      await queryClient.invalidateQueries({
        queryKey: ["partnerRequests", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["partnerData", user?.id],
      });

      setRequests((prev) => prev.filter((req) => req.id !== requestId));

      navigation.navigate("Home", {
        screen: "PartnerProfile",
        params: { userId: String(senderId) },
      });
    } catch (error: any) {
      setAlertTitle("Failed");
      setAlertMessage("Failed to accept request.");
      setShowErrorAlert(true);
    } finally {
      setProcessingAccept(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingReject(requestId);
    try {
      await rejectPartnerRequest(token, requestId);

      await queryClient.invalidateQueries({
        queryKey: ["partnerRequests", user?.id],
      });

      setRequests((prev) => prev.filter((req) => req.id !== requestId));

      setAlertTitle("Declined");
      setAlertMessage("You declined the partner request.");
      setShowInfoAlert(true);
    } catch (error: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        error.response?.data?.error || "Failed to decline the request."
      );
      setShowErrorAlert(true);
    } finally {
      setProcessingReject(null);
    }
  };

  // render the requests
  const renderRequest = ({ item }: { item: PendingRequest }) => {
    if (!item.sender) {
      return null;
    }

    const isAccepting = processingAccept === item.id;
    const isRejecting = processingReject === item.id;
    const isProcessing = isAccepting || isRejecting;

    return (
      <View style={styles.requestItem}>
        <View style={styles.userInfo}>
          <ProfileImage userId={item.sender.id} token={token!} />
          <View style={styles.userDetails}>
            <Text style={styles.username}>@{item.sender.username}</Text>
            <Text style={styles.requestText}>wants to be your partner</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id, item.sender!.id)}
            disabled={isProcessing}
          >
            {isAccepting ? (
              <ActivityIndicator color={theme.colors.text} size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Accept</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDeclineRequest(item.id)}
            disabled={isProcessing}
          >
            {isRejecting ? (
              <ActivityIndicator color={theme.colors.text} size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Decline</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending partner requests</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      <AlertModal
        visible={showErrorAlert}
        type="error"
        title={alertTitle}
        message={alertMessage}
        buttonText="Close"
        onClose={() => setShowErrorAlert(false)}
      />

      <AlertModal
        visible={showInfoAlert}
        title={alertTitle}
        message={alertMessage}
        buttonText="OK"
        onClose={() => setShowInfoAlert(false)}
      />
    </View>
  );
};

export default PendingRequestsScreen;

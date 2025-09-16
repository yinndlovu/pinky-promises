// external
import React, { useEffect, useState } from "react";
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

// screen content
import AlertModal from "../../../components/modals/output/AlertModal";
import styles from "../styles/PendingRequestsScreen.styles";

// variables
const fallbackAvatar = require("../../../assets/default-avatar-two.png");

const PendingRequestsScreen = ({ navigation }: any) => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();

  // use states
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // use states (processing)
  const [processingAccept, setProcessingAccept] = useState<string | null>(null);
  const [processingReject, setProcessingReject] = useState<string | null>(null);

  if (!token) {
    return;
  }

  useEffect(() => {
    (async () => {
      try {
        const requestsData = await getReceivedPartnerRequests(token);
        setRequests(
          requestsData.filter((r: PendingRequest) => r.status === "pending")
        );
      } catch (err) {
        console.error("failed to fetch requests", err);
      }
    })();
  }, []);

  const renderProfileImage = (userId: string) => {
    const [failed, setFailed] = useState(false);

    const { avatarUri, profilePicUpdatedAt, fetchPicture } = useProfilePicture(
      userId,
      token
    );

    useEffect(() => {
      fetchPicture();
    }, [fetchPicture]);

    if (avatarUri && profilePicUpdatedAt) {
      const cachedImageUrl = buildCachedImageUrl(
        userId,
        Math.floor(new Date(profilePicUpdatedAt).getTime() / 1000)
      );

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

    return null;
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

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

      navigation.replace("PartnerProfile", { userId: senderId });
    } catch (error: any) {
      showAlert(error.response?.data?.error || "Failed to accept request");
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

      showAlert("Partner request declined");
    } catch (error: any) {
      showAlert(error.response?.data?.error || "Failed to reject request");
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
          {renderProfileImage(item.sender.id)}
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
              <ActivityIndicator color="#fff" size="small" />
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
              <ActivityIndicator color="#fff" size="small" />
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
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default PendingRequestsScreen;

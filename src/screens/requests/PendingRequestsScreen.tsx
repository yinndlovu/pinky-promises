// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encode } from "base64-arraybuffer";
import axios from "axios";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";

// internal
import {
  getReceivedPartnerRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
} from "../../services/api/profiles/partnerService";
import { BASE_URL } from "../../configuration/config";
import { buildCachedImageUrl } from "../../utils/imageCacheUtils";
import { PendingRequest } from "../../types/Request";

// screen content
import AlertModal from "../../components/modals/output/AlertModal";
import styles from "./styles/PendingRequestsScreen.styles";
import LoadingSpinner from "../../components/loading/LoadingSpinner";

// variables
const fallbackAvatar = require("../../assets/default-avatar-two.png");

const PendingRequestsScreen = ({ navigation }: any) => {
  // variables
  const queryClient = useQueryClient();

  // use states
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [profilePictures, setProfilePictures] = useState<{
    [userId: string]: string;
  }>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<{
    [userId: string]: Date;
  }>({});

  // use states (processing)
  const [loading, setLoading] = useState(true);
  const [processingAccept, setProcessingAccept] = useState<string | null>(null);
  const [processingReject, setProcessingReject] = useState<string | null>(null);

  // use effects
  useEffect(() => {
    fetchRequests();
  }, []);

  // fetch functions
  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        showAlert("Session expired, please log in again");
        return;
      }

      const requestsData = await getReceivedPartnerRequests(token);
      const pendingRequests = requestsData.filter(
        (req: PendingRequest) => req.status === "pending"
      );
      setRequests(pendingRequests);

      const pics: { [userId: string]: string } = {};
      const updatedAts: { [userId: string]: Date } = {};
      await Promise.all(
        requestsData.map(async (req: PendingRequest) => {
          if (req.sender) {
            try {
              const response = await axios.get(
                `${BASE_URL}/api/profile/get-profile-picture/${req.sender.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  responseType: "arraybuffer",
                }
              );
              const mime = response.headers["content-type"] || "image/jpeg";
              const base64 = `data:${mime};base64,${encode(response.data)}`;
              pics[req.sender.id] = base64;

              const lastModified = response.headers["last-modified"];
              updatedAts[req.sender.id] = lastModified
                ? new Date(lastModified)
                : new Date();
            } catch (err) {}
          }
        })
      );
      setProfilePictures(pics);
      setProfilePicUpdatedAt(updatedAts);
    } catch (error: any) {
      showAlert(error.response?.data?.error || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  // helpers
  const renderProfileImage = (userId: string) => {
    if (profilePictures[userId] && profilePicUpdatedAt[userId]) {
      const cachedImageUrl = buildCachedImageUrl(
        userId,
        profilePicUpdatedAt[userId]
      );
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
      <Image source={fallbackAvatar} style={styles.avatar} contentFit="cover" />
    );
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // handlers
  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    setProcessingAccept(requestId);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        showAlert("Session expired, please log in again");
        return;
      }

      await acceptPartnerRequest(token, requestId);
      await queryClient.invalidateQueries({
        queryKey: ["partnerRequests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["partnerData"],
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
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        showAlert("Session expired, please log in again");

        return;
      }

      await rejectPartnerRequest(token, requestId);
      await queryClient.invalidateQueries({
        queryKey: ["partnerRequests"],
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

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

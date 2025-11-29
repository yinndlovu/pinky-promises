// external
import { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

// internal
import {
  getReceivedPartnerRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
} from "../../../services/api/profiles/partnerService";
import { PendingRequest } from "../../../types/Request";
import { createPendingRequestsStyles } from "../styles/PendingRequestsScreen.styles";

// internal (hooks)
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useTheme } from "../../../theme/ThemeContext";

// screen content
import AlertModal from "../../../components/modals/output/AlertModal";
import RequestItem from "../components/RequestItem";

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
        queryKey: ["profile", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", user?.id],
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
        queryKey: ["profile", user?.id],
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

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestItem
            item={item}
            processingAccept={processingAccept}
            processingReject={processingReject}
            onAccept={handleAcceptRequest}
            onReject={handleDeclineRequest}
          />
        )}
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

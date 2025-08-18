// external
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, View, Text } from "react-native";

// internal
import {
  getTriviaSocket,
  connectTriviaSocket,
} from "../../services/games/trivia/triviaSocketService";
import { useAuth } from "../../contexts/AuthContext";
import { fetchCurrentUserProfileAndAvatar } from "../helpers/userDetailsHelper";
import { Invite } from "../interfaces/Invite";

// content
import GameInviteModal from "../components/modals/GameInviteModal";
import LoadingSpinner from "../../components/loading/LoadingSpinner";

// types
type RootStackParamList = {
  GameWaitingScreen: {
    gameName: string;
    yourInfo: { id: string; name: string; avatarUrl: string };
    partnerInfo?: { id: string; name: string; avatarUrl: string } | null;
    roomId?: string;
  };
  GameSetupScreen: {
    roomId: string;
    players: { id: string; name: string; avatarUrl: string }[];
    gameName: string;
    host: string;
  };
  LoginScreen: undefined;
  GameListScreen: undefined;
};

// interfaces
interface InviteContextType {
  invite: Invite | null;
  setInvite: (invite: Invite | null) => void;
  inviteAccepted: boolean;
  setInviteAccepted: (val: boolean) => void;
}

const InviteContext = createContext<InviteContextType | undefined>(undefined);

export const InviteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // variables
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // use states
  const [invite, setInvite] = useState<Invite | null>(null);
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // use effects
  useEffect(() => {
    const socket = connectTriviaSocket();

    if (user?.id) {
      socket.emit("register_user", { userId: user.id });
    }

    socket.on(
      "receive_invite",
      ({ inviteId, inviterId, inviterName, gameName, roomId }) => {
        setInvite({ inviteId, inviterId, inviterName, gameName, roomId });
      }
    );

    socket.on("invite_accepted", ({ roomId, gameName, partnerInfo }) => {});

    socket.on("invite_declined", ({ partnerId }) => {
      setInvite(null);
      alert("Your invite was declined.");
    });

    return () => {
      socket.off("receive_invite");
      socket.off("invite_accepted");
      socket.off("invite_declined");
    };
  }, [user, navigation]);

  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // handlers
  const handleAccept = async () => {
    if (!invite || !user) {
      setToastMessage("No invite or user data available.");
      return;
    }

    try {
      setJoining(true);

      const userInfo = await fetchCurrentUserProfileAndAvatar();

      if (!userInfo) {
        setToastMessage("Failed to fetch user profile.");
        setInvite(null);
        return;
      }

      const socket = getTriviaSocket();

      if (socket) {
        socket.emit("accept_invite", {
          inviteId: invite.inviteId,
          partnerInfo: userInfo,
        });

        setInviteAccepted(true);
      } else {
        throw new Error("Socket not available");
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
      setToastMessage("Failed to accept invite. Please try again.");
      setInvite(null);
    } finally {
      setJoining(false);
    }
  };

  const handleDecline = () => {
    if (invite) {
      const socket = getTriviaSocket();
      socket?.emit("decline_invite", {
        inviteId: invite.inviteId,
        partnerId: user?.id,
      });
      setInvite(null);
    }
  };

  return (
    <InviteContext.Provider
      value={{ invite, setInvite, inviteAccepted, setInviteAccepted }}
    >
      {children}
      {invite && (
        <GameInviteModal
          visible={!!invite}
          inviterName={invite.inviterName}
          gameName={invite.gameName}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      {joining && (
        <View style={styles.centered}>
          <LoadingSpinner message="Joining..." size="medium" />
        </View>
      )}

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </InviteContext.Provider>
  );
};

export const useInvite = () => {
  const context = useContext(InviteContext);
  if (!context) {
    throw new Error("useInvite must be used within an InviteProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    position: "absolute",
    bottom: 10,
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

// external
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { v4 as uuidv4 } from "uuid";

// internal
import {
  connectTriviaSocket,
  disconnectTriviaSocket,
  getTriviaSocket,
} from "../../services/games/trivia/triviaSocketService";
import { Player } from "../interfaces/Player";

// content
const fallbackAvatar = require("../../assets/default-avatar-two.png");
import AlertModal from "../../components/modals/output/AlertModal";

// types
type RootStackParamList = {
  GameWaitingScreen: {
    gameName: string;
    yourInfo: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    partnerInfo?: {
      id: string;
      name: string;
      avatarUrl: string;
    } | null;
    roomId?: string;
    showToast?: boolean;
    isInviter?: boolean;
    options?: {
      amount: number;
      category: string;
      difficulty: string;
      type?: string;
    };
  };
  GameSetupScreen: {
    roomId: string;
    players: Player[];
    gameName: string;
    host: string;
  };
  GameSessionScreen: {
    roomId: string;
    players: Player[];
    gameName: string;
    host: string;
    options: {
      amount: number;
      category: string;
      difficulty: string;
      type?: string;
    };
  };
};

type Props = StackScreenProps<RootStackParamList, "GameWaitingScreen">;

const GameWaitingScreen: React.FC<Props> = ({ navigation, route }) => {
  // params
  const {
    gameName,
    yourInfo,
    partnerInfo,
    roomId: routeRoomId,
    showToast: shouldShowToast,
  } = route.params;

  // variables
  const roomIdRef = useRef(routeRoomId || uuidv4());

  // use states
  const [players, setPlayers] = useState<Player[]>([yourInfo]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  // check if game has started
  const hasStartedRef = useRef(false);
  const navigatedRef = useRef(false);

  // use effects
  useEffect(() => {
    if (shouldShowToast) {
      setToastMessage("Game invitation sent");
    }
  }, [shouldShowToast]);

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

  useEffect(() => {
    const socket = connectTriviaSocket();
    const roomId = roomIdRef.current;

    const handlePlayersUpdate = (playersList: Player[]) => {
      setPlayers(playersList);

      const isInviter = route.params.isInviter ?? true;
      const options = (route.params as any).options;
      if (!hasStartedRef.current && playersList.length === 2 && isInviter && options) {
        hasStartedRef.current = true;
        socket.emit("start_trivia", { roomId, options });
      }
    };

    socket.on("players_update", handlePlayersUpdate);

    socket.on("invite_declined", () => {
      setAlertMessage("Your partner declined the invite");
      setAlertVisible(true);
      navigation.popToTop();
    });

    socket.on("player_left", () => {
      setAlertMessage("Your partner left the game");
      setAlertVisible(true);
      navigation.popToTop();
    });

    socket.on("error", (err) => {
      setToastMessage(err.message || "An error occurred");
      navigation.popToTop();
    });

    socket.on("game_start", (payload?: { options?: any }) => {
      if (navigatedRef.current) {
        return;
      }

      navigatedRef.current = true;

      const isInviter = route.params.isInviter ?? true;
      const hostName = isInviter ? yourInfo.name : partnerInfo?.name || "";
      const routeOptions = (route.params as any).options;
      const options = routeOptions || payload?.options;

      navigation.replace("GameSessionScreen", {
        roomId: roomIdRef.current,
        players,
        gameName,
        host: hostName,
        options,
      });
    });

    socket.on("question", (payload?: { options?: any }) => {
      if (navigatedRef.current) {
        return;
      }
      navigatedRef.current = true;
    
      const isInviter = route.params.isInviter ?? true;
      const hostName = isInviter ? yourInfo.name : partnerInfo?.name || "";
      const routeOptions = (route.params as any).options;
      const options = routeOptions || payload?.options;
    
      navigation.replace("GameSessionScreen", {
        roomId: roomIdRef.current,
        players,
        gameName,
        host: hostName,
        options,
      });
    });

    socket.emit("join_trivia", {
      roomId,
      player: yourInfo,
    });

    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("invite_declined");
      socket.off("player_left");
      socket.off("error");
      socket.off("game_start");
      socket.off("question");
    };
  }, []);

  // handlers
  const handleLeave = () => {
    const socket = getTriviaSocket();

    if (socket) {
      socket.emit("leave_trivia", {
        roomId: roomIdRef.current,
        playerId: yourInfo.id,
      });
    }

    disconnectTriviaSocket();
    navigation.popToTop();
  };

  // find partner
  const partner = players.find((p) => p.id !== yourInfo.id);

  return (
    <View style={styles.container}>
      <View style={styles.playersContainer}>
        <View style={styles.player}>
          <Image
            source={
              yourInfo.avatarUrl ? { uri: yourInfo.avatarUrl } : fallbackAvatar
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{yourInfo.name}</Text>
          <Text style={styles.status}>Ready</Text>
        </View>

        {partner ? (
          <View style={styles.player}>
            <Image
              source={
                partner.avatarUrl ? { uri: partner.avatarUrl } : fallbackAvatar
              }
              style={styles.avatar}
            />
            <Text style={styles.name}>{partner.name}</Text>
            <Text style={styles.status}>Joined</Text>
          </View>
        ) : (
          <Text style={styles.waitingText}>Waiting for partner...</Text>
        )}
      </View>

      <View style={{ borderRadius: 12, overflow: "hidden", marginTop: 16 }}>
        <Pressable
          style={({ pressed }) => [
            styles.leaveButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          android_ripple={{ color: "#a82f6aff" }}
          onPress={handleLeave}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
      </View>
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default GameWaitingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 32,
  },
  playersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 32,
  },
  player: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: "#555",
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  status: {
    color: "#b0b3c6",
    fontSize: 14,
  },
  waitingText: {
    color: "#b0b3c6",
    fontSize: 16,
    fontStyle: "italic",
    alignSelf: "center",
  },
  countdown: {
    color: "#e03487",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 24,
  },
  leaveButton: {
    backgroundColor: "#e03487",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  leaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
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

// external
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, Pressable, Alert } from "react-native";
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
  };
  GameSetupScreen: {
    roomId: string;
    players: Player[];
    gameName: string;
    host: string;
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

  // use effects
  useEffect(() => {
    const socket = connectTriviaSocket();
    const roomId = roomIdRef.current;

    socket.emit("join_trivia", {
      roomId,
      player: yourInfo,
    });

    useEffect(() => {
      if (shouldShowToast) {
        setToastMessage("Invite sent");
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

    // handlers
    const handlePlayersUpdate = (playersList: Player[]) => {
      setPlayers(playersList);
      if (playersList.length === 2 && !countdown) {
        setCountdown(5);
      }
    };

    socket.on("players_update", handlePlayersUpdate);

    socket.on("invite_accepted", ({ roomId, gameName, partnerInfo }) => {
      setPlayers((prev) => {
        const newPlayers = [...prev, partnerInfo];
        if (newPlayers.length === 2 && !countdown) {
          setCountdown(5);
        }
        return newPlayers;
      });
    });

    socket.on("invite_declined", () => {
      Alert.alert("Invite Declined", "Your partner declined the invite.");
      navigation.popToTop();
    });

    socket.on("player_left", (data) => {
      Alert.alert(
        "Player Left",
        "Your partner left the room. Returning to home."
      );
      navigation.popToTop();
    });

    socket.on("error", (err) => {
      Alert.alert("Error", err.message || "An error occurred.");
      navigation.popToTop();
    });

    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("invite_accepted");
      socket.off("invite_declined");
      socket.off("player_left");
      socket.off("error");
      disconnectTriviaSocket();
    };
  }, []);

  useEffect(() => {
    if (countdown === null) {
      return;
    }
    
    if (countdown === 0) {
      navigation.replace("GameSetupScreen", {
        roomId: roomIdRef.current,
        players,
        gameName,
        host: yourInfo.name,
      });
      return;
    }
    const timer = setTimeout(
      () => setCountdown((prev) => (prev ? prev - 1 : null)),
      1000
    );
    return () => clearTimeout(timer);
  }, [countdown, players, navigation, gameName, yourInfo.name]);

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

      {countdown && (
        <Text style={styles.countdown}>Starting game in {countdown}...</Text>
      )}

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

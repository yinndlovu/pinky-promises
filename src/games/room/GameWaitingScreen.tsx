// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";

interface Player {
  name: string;
  avatarUrl?: string;
}

type RootStackParamList = {
  GameWaitingScreen: {
    gameName: string;
    yourInfo: {
      name: string;
      avatarUrl: string;
    };
    partnerInfo: {
      name: string;
      avatarUrl: string;
    } | null;
  };
  GameSetupScreen: {
    gameId: number;
    gameName: string;
    host: string;
  };
  TriviaGameScreen: {
    gameId: number;
    gameName: string;
  };
};

type Props = StackScreenProps<RootStackParamList, "GameWaitingScreen">;

const GameWaitingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { gameName, yourInfo, partnerInfo } = route.params;
  const [countdown, setCountdown] = useState<number | null>(null);
  const [partnerInfoState, setPartnerInfo] = useState(partnerInfo);

  useEffect(() => {
    const joinTimer = setTimeout(() => {
      setPartnerInfo({
        name: "Alex",
        avatarUrl: "https://example.com/avatar.png",
      });
    }, 3000);
    return () => clearTimeout(joinTimer);
  }, []);

  useEffect(() => {
    if (!partnerInfoState) return;

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) return prev - 1;
        clearInterval(timer);

        navigation.navigate("GameSetupScreen", {
          gameId: 123,
          gameName,
          host: yourInfo.name,
        });

        return null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [partnerInfoState]);

  return (
    <View style={styles.container}>
      <View style={styles.playersContainer}>
        <View style={styles.player}>
          <Image
            source={{
              uri: yourInfo.avatarUrl || "https://via.placeholder.com/80",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{yourInfo.name}</Text>
          <Text style={styles.status}>Ready</Text>
        </View>

        <View style={styles.player}>
          <Image
            source={{
              uri:
                partnerInfoState?.avatarUrl || "https://via.placeholder.com/80",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{partnerInfoState?.name || "Partner"}</Text>
          <Text style={styles.status}>
            {partnerInfoState ? "Joined" : "Waiting for partner..."}
          </Text>
        </View>
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
          onPress={() => console.log("Leave pressed")}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
      </View>
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
});

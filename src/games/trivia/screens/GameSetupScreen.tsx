// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

// internal
import { categories, CATEGORY_ID_TO_KEY } from "../constants/trivia";
import { getTriviaSocket } from "../../../services/games/trivia/triviaSocketService";
import { useAuth } from "../../../contexts/AuthContext";

const GameSetupScreen = ({ navigation, route }: any) => {
  const { roomId, players, gameName, host } = route.params;
  const { user } = useAuth();

  // use states
  const [totalQuestions, setTotalQuestions] = useState("10");
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState<number | null>(null);
  const [type, setType] = useState<"multiple" | "boolean" | "any">("any");

  useEffect(() => {
    const socket = getTriviaSocket();

    if (!socket) {
      return;
    }

    socket.on("game_start", () => {
      navigation.replace("GameSessionScreen", {
        roomId,
        players,
        gameName,
        host,
      });
    });

    socket.on("error", (err) => {
      alert(err.message || "An error occurred");
      navigation.popToTop();
    });

    return () => {
      socket.off("game_start");
      socket.off("error");
    };
  }, [navigation, roomId, players, gameName, host]);

  const startGame = () => {
    if (!category || user?.name !== host) {
      return;
    }

    const options = {
      amount: parseInt(totalQuestions),
      category: CATEGORY_ID_TO_KEY[category],
      difficulty,
      type: type === "any" ? undefined : type,
    };

    const socket = getTriviaSocket();

    if (!socket) {
      return;
    }

    const yourPlayer = players.find((p: any) => p.id === user?.id);
    const partnerPlayer = players.find((p: any) => p.id !== user?.id);

    if (!yourPlayer || !partnerPlayer) {
      alert("Missing player info");
      return;
    }

    socket.emit("send_invite", {
      inviterId: yourPlayer.id,
      partnerId: partnerPlayer.id,
      inviterName: yourPlayer.name,
      gameName,
      roomId,
    });

    socket.emit("join_trivia", {
      roomId,
      player: yourPlayer,
    });

    navigation.replace("GameWaitingScreen", {
      gameName,
      yourInfo: yourPlayer,
      partnerInfo: partnerPlayer,
      roomId,
      showToast: true,
      isInviter: true,
      options,
    });
  };

  const renderOption = (
    currentValue: string | number,
    selectedValue: string | number,
    onSelect: () => void,
    label: string,
    keyProp?: string | number
  ) => (
    <Pressable
      key={keyProp}
      onPress={onSelect}
      style={[
        styles.optionButton,
        currentValue === selectedValue && styles.optionButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          currentValue === selectedValue && styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Total Questions</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={totalQuestions}
        onChangeText={setTotalQuestions}
        placeholder="Enter number"
        placeholderTextColor="#777"
      />

      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.row}>
        {["easy", "medium", "hard"].map((diff) =>
          renderOption(difficulty, diff, () => setDifficulty(diff), diff, diff)
        )}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategory(cat.id)}
            style={[
              styles.categoryButton,
              category === cat.id && styles.categoryButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat.id && styles.categoryTextSelected,
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        {renderOption(
          type,
          "any",
          () => setType("any"),
          "Any"
        )}
        {renderOption(
          type,
          "multiple",
          () => setType("multiple"),
          "Multiple Choice"
        )}
        {renderOption(
          type,
          "boolean",
          () => setType("boolean"),
          "True / False"
        )}
      </View>

      <View style={{ borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
        <Pressable
          onPress={startGame}
          android_ripple={{ color: "#a82f6aff" }}
          style={styles.startButton}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default GameSetupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    padding: 16,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2a2b44",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#2a2b44",
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#e03487",
  },
  optionText: {
    color: "#fff",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: "#2a2b44",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#e03487",
  },
  categoryText: {
    color: "#fff",
    fontSize: 13,
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#e03487",
    paddingVertical: 14,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

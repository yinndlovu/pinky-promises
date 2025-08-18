// external
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { Player } from "../types/Player";
import {
  connectTriviaSocket,
  disconnectTriviaSocket,
  getTriviaSocket,
} from "../../../services/games/trivia/triviaSocketService";
import { useAuth } from "../../../contexts/AuthContext";
import { Question } from "../interfaces/Question";

// content
const fallbackAvatar = require("../../../assets/default-avatar-two.png");
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

// content
import GameSummaryModal from "../components/GameSummaryModal";

// interfaces
interface GameSessionScreenProps {
  route: {
    params: {
      roomId: string;
      players: Player[];
      options: {
        amount: number;
        category: string;
        difficulty: string;
        type: string;
      };
      gameName: string;
      host: any;
    };
  };
  navigation: any;
}

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  videogames: "Video Games",
  boardgames: "Board Games",
  general: "General Knowledge",
};

const GameSessionScreen = ({ route, navigation }: GameSessionScreenProps) => {
  // params
  const { roomId, players, options, gameName, host } = route.params;
  const { amount: totalQuestions, category, difficulty, type } = options;

  // variables
  const { user } = useAuth();
  const timerAnim = useRef(new Animated.Value(1)).current;

  // use states
  const [question, setQuestion] = useState<Question | null>(null);
  const [gamePlayers, setGamePlayers] = useState<Player[]>(players);
  const [gameOver, setGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // timer animation
  const startTimer = () => {
    setTimeLeft(15);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
    }).start();
  };

  // use effects
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setCurrentPlayerId(user.id);
    setIsLoading(false);

    const socket = connectTriviaSocket();

    if (players.length > 0) {
      setCurrentPlayerId(user?.id);
    }

    socket.on("game_start", () => {
      setGamePlayers(
        players.map((p: Player) => ({ ...p, score: 0, status: null }))
      );
    });

    socket.on("question", (data) => {
      setQuestion(data.question);
      setGamePlayers((prev) => prev.map((p) => ({ ...p, status: null })));
      startTimer();
    });

    socket.on("players_update", (updatedPlayers) => {
      setGamePlayers(updatedPlayers);
    });

    socket.on("answer_result", (result) => {
      setGamePlayers((prev) =>
        prev.map((p) =>
          p.id === currentPlayerId
            ? {
                ...p,
                status: result.correct ? "correct" : "wrong",
                score: result.correct ? p.score + 1 : p.score,
              }
            : p
        )
      );
    });

    socket.on("game_over", (data) => {
      setGameOver(true);
      setShowSummary(true);
      setGamePlayers(
        data.players.map((p: Player) => ({
          ...p,
          score: data.scores[p.id] || 0,
        }))
      );
    });

    socket.on("player_left", (data) => {
      setGamePlayers(data.players);
      setGameOver(true);
      setShowSummary(true);
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data.message);
    });

    return () => {
      disconnectTriviaSocket();
    };
  }, [players, user]);

  useEffect(() => {
    if (question) {
      startTimer();
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (question) {
              handleTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [question]);

  // handlers
  const submitAnswer = (answer: string) => {
    const socket = getTriviaSocket();
    if (socket && currentPlayerId) {
      socket.emit("submit_answer", {
        roomId,
        playerId: currentPlayerId,
        answer,
      });
    }
  };

  const handleTimeUp = () => {
    setGamePlayers((prev) =>
      prev.map((p) =>
        p.id === currentPlayerId && !p.status
          ? { ...p, status: "unanswered" }
          : p
      )
    );
  };

  const handleQuit = () => {
    const socket = getTriviaSocket();
    if (socket && currentPlayerId) {
      socket.emit("leave_trivia", {
        roomId,
        playerId: currentPlayerId,
      });
    }
    navigation.goBack();
  };

  const handleSendReaction = (emoji: string) => {
    const socket = getTriviaSocket();
    if (socket && currentPlayerId) {
      socket.emit("send_reaction", {
        roomId,
        playerId: currentPlayerId,
        emoji,
      });
    }
  };

  // helpers
  const renderAnswers = () => {
    if (!question) {
      return null;
    }

    if (type === "boolean") {
      return (
        <View style={styles.answersRow}>
          {["True", "False"].map((ans) => (
            <Pressable
              key={ans}
              onPress={() => submitAnswer(ans)}
              style={styles.answerButton}
            >
              <Text style={styles.answerText}>{ans}</Text>
            </Pressable>
          ))}
        </View>
      );
    } else {
      const allAnswers = [
        question.correct_answer,
        ...question.incorrect_answers,
      ].sort(() => Math.random() - 0.5);

      return (
        <View style={styles.answersGrid}>
          {allAnswers.map((ans) => (
            <Pressable
              key={ans}
              onPress={() => submitAnswer(ans)}
              style={styles.answerButton}
            >
              <Text style={styles.answerText}>{ans}</Text>
            </Pressable>
          ))}
        </View>
      );
    }
  };

  const progressWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const categoryDisplayName =
    DISPLAY_NAME_OVERRIDES[category] ||
    category.charAt(0).toUpperCase() + category.slice(1);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading session..." size="medium" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playersRow}>
        {gamePlayers.map((p) => (
          <View key={p.id} style={styles.playerCard}>
            <Image
              source={p.avatar ? { uri: p.avatar } : fallbackAvatar}
              style={styles.playerAvatar}
            />
            <Text style={styles.playerName}>{p.name}</Text>
            <Text style={styles.playerScore}>{p.score}</Text>
            {p.status && (
              <Text
                style={[
                  styles.statusText,
                  p.status === "correct" && { color: "#4caf50" },
                  p.status === "wrong" && { color: "#f44336" },
                  p.status === "unanswered" && { color: "#ffc107" },
                ]}
              >
                {p.status}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question ? question.question : "Loading question..."}
        </Text>
      </View>

      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={20} color="#fff" />
        <Text style={styles.timerText}>{timeLeft}s</Text>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>
      </View>

      {renderAnswers()}

      <View style={styles.emojiRow}>
        {["😭", "😂", "😲", "😠", "🤍"].map((emoji) => (
          <Pressable
            key={emoji}
            style={styles.emojiButton}
            onPress={() => handleSendReaction(emoji)}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.quitButton} onPress={handleQuit}>
        <Text style={styles.quitButtonText}>Quit</Text>
      </Pressable>

      <GameSummaryModal
        visible={showSummary}
        players={gamePlayers}
        category={categoryDisplayName}
        totalQuestions={totalQuestions}
        gameType="Trivia"
        onClose={() => {
          setShowSummary(false);
          handleQuit();
        }}
        onPlayAgain={() => {
          setShowSummary(false);
          setGamePlayers(
            players.map((p: Player) => ({ ...p, score: 0, status: null }))
          );
          const socket = getTriviaSocket();
          if (socket) {
            socket.emit("join_trivia", {
              roomId,
              player: players.find((p: Player) => p.id === currentPlayerId),
              options,
            });
          }
        }}
      />
    </View>
  );
};

export default GameSessionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23243a",
    padding: 16,
  },
  playersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  playerCard: {
    backgroundColor: "#2a2b44",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "45%",
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  playerName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  playerScore: {
    color: "#e03487",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  statusText: {
    marginTop: 4,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
  },
  timerContainer: {
    marginBottom: 20,
  },
  timerText: {
    color: "#fff",
    marginLeft: 6,
    marginBottom: 4,
  },
  progressBarBg: {
    backgroundColor: "#555",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: "#e03487",
    height: "100%",
  },
  answersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  answersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  answerButton: {
    backgroundColor: "#2a2b44",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 6,
    minWidth: "40%",
    alignItems: "center",
  },
  answerText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  emojiButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  quitButton: {
    backgroundColor: "#e20000ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  quitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

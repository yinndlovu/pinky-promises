// external
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { Player } from "../types/Player";

const sampleQuestion = {
  question: "What is the capital of France?",
  correct_answer: "Paris",
  incorrect_answers: ["London", "Berlin", "Madrid"],
};

const GameSessionScreen = ({ route, navigation }: any) => {
  const { totalQuestions, difficulty, category, type } = route.params;

  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Yin", score: 0, avatar: "https://example.com/yin.png", status: null },
    { id: 2, name: "Alex", score: 0, avatar: "https://example.com/alex.png", status: null },
  ]);

  // question and timer state
  const [currentQuestion, setCurrentQuestion] = useState(sampleQuestion);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerAnim = useRef(new Animated.Value(1)).current;

  const startTimer = () => {
    setTimeLeft(15);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    startTimer();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleAnswer = (answer: string) => {
    let isCorrect = answer === currentQuestion.correct_answer;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === 1
          ? {
              ...p,
              status: isCorrect ? "correct" : "wrong",
              score: isCorrect ? p.score + 1 : p.score,
            }
          : p
      )
    );

  };

  const handleTimeUp = () => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.status ? p : { ...p, status: "unanswered" }
      )
    );
  };

  const renderAnswers = () => {
    if (type === "boolean") {
      return (
        <View style={styles.answersRow}>
          {["True", "False"].map((ans) => (
            <Pressable
              key={ans}
              onPress={() => handleAnswer(ans)}
              style={styles.answerButton}
            >
              <Text style={styles.answerText}>{ans}</Text>
            </Pressable>
          ))}
        </View>
      );
    } else {
      const allAnswers = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers,
      ].sort(() => Math.random() - 0.5);

      return (
        <View style={styles.answersGrid}>
          {allAnswers.map((ans) => (
            <Pressable
              key={ans}
              onPress={() => handleAnswer(ans)}
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

  return (
    <View style={styles.container}>
      <View style={styles.playersRow}>
        {players.map((p) => (
          <View key={p.id} style={styles.playerCard}>
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
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
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
});

// external
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

// game categories for trivia
const categories = [
  { id: 9, name: "General Knowledge" },
  { id: 21, name: "Sports" },
  { id: 23, name: "History" },
  { id: 17, name: "Science & Nature" },
  { id: 22, name: "Geography" },
  { id: 12, name: "Music" },
  { id: 11, name: "Film" },
];

const GameSetupScreen = ({ navigation }: any) => {
  // use states
  const [totalQuestions, setTotalQuestions] = useState("10");
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState<number | null>(null);
  const [type, setType] = useState("multiple");

  const startGame = () => {
    navigation.replace("GameSessionScreen", {
      totalQuestions: parseInt(totalQuestions),
      difficulty,
      category,
      type,
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

// external
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { createCustomAid } from "../../../services/api/period/periodService";
import {
  PeriodProblem,
  PeriodProblemLabels,
  PeriodProblemEmojis,
} from "../../../types/Period";
import { PeriodStackParamList } from "../../../types/StackParamList";

// types
type Props = NativeStackScreenProps<PeriodStackParamList, "AddCustomAidScreen">;

// constants
const PROBLEMS: PeriodProblem[] = [
  "cramps",
  "bloating",
  "headaches",
  "fatigue",
  "mood_swings",
  "back_pain",
  "nausea",
  "breast_tenderness",
  "acne",
  "insomnia",
  "cravings",
  "anxiety",
  "irritability",
  "dizziness",
  "hot_flashes",
];

const AddCustomAidScreen: React.FC<Props> = ({ navigation, route }) => {
  const { onSuccess } = route.params || {};

  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();

  // use states
  const [selectedProblem, setSelectedProblem] = useState<PeriodProblem | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // handlers
  const handleSubmit = async () => {
    if (!token) {
      setError("Your session has expired. Log in again and retry.");
      return;
    }

    if (!selectedProblem || !title.trim()) {
      setError("Please select a problem and enter a title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCustomAid(token, {
        problem: selectedProblem,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (onSuccess) {
        onSuccess();
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add custom aid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Your Need</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>What is this for?</Text>
              <View style={styles.problemGrid}>
                {PROBLEMS.map((problem) => (
                  <TouchableOpacity
                    key={problem}
                    style={[
                      styles.problemChip,
                      selectedProblem === problem && styles.problemChipActive,
                    ]}
                    onPress={() => setSelectedProblem(problem)}
                  >
                    <Text style={styles.problemEmoji}>
                      {PeriodProblemEmojis[problem]}
                    </Text>
                    <Text
                      style={[
                        styles.problemText,
                        selectedProblem === problem && styles.problemTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {PeriodProblemLabels[problem]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>What helps you?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Hot water bottle, Dark chocolate"
                placeholderTextColor={theme.colors.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={styles.label}>More details (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional notes..."
                placeholderTextColor={theme.colors.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color="#ff6b6b" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedProblem || !title.trim()) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || !selectedProblem || !title.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="plus" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Add</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    innerContainer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingTop: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    problemGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    problemChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 2,
      borderColor: "transparent",
    },
    problemChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "15",
    },
    problemEmoji: {
      fontSize: 16,
      marginRight: 6,
    },
    problemText: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: "500",
    },
    problemTextActive: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    input: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ff6b6b15",
      padding: 12,
      borderRadius: 10,
      gap: 8,
      marginBottom: 16,
    },
    errorText: {
      color: "#ff6b6b",
      fontSize: 14,
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
      paddingTop: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: "center",
    },
    cancelText: {
      color: theme.colors.muted,
      fontSize: 16,
      fontWeight: "600",
    },
    submitButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default AddCustomAidScreen;

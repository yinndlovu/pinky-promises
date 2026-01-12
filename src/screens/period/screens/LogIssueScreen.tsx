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
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { logIssue } from "../../../services/api/period/periodService";
import {
  PeriodProblem,
  PeriodProblemLabels,
  PeriodProblemEmojis,
} from "../../../types/Period";
import { PeriodStackParamList } from "../../../types/StackParamList";

// types
type Props = NativeStackScreenProps<PeriodStackParamList, "LogIssueScreen">;

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

const LogIssueScreen: React.FC<Props> = ({ navigation, route }) => {
  const { onSuccess } = route.params;

  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();

  // use states
  const [selectedProblem, setSelectedProblem] = useState<PeriodProblem | null>(
    null
  );
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // computed values
  const severityColor = useMemo(() => {
    if (severity <= 3) return "#4caf50";
    if (severity <= 6) return "#ff9800";
    return "#f44336";
  }, [severity]);

  const severityLabel = useMemo(() => {
    if (severity <= 2) return "Very Mild";
    if (severity <= 4) return "Mild";
    if (severity <= 6) return "Moderate";
    if (severity <= 8) return "Severe";
    return "Very Severe";
  }, [severity]);

  // handlers
  const handleSubmit = async () => {
    if (!token || !selectedProblem) {
      setError("Please select a problem");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await logIssue(token, {
        problem: selectedProblem,
        severity,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to log issue");
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
              <Text style={styles.headerTitle}>Log Issue for Partner</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>What are they experiencing?</Text>
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

              <Text style={styles.label}>How severe is it?</Text>
              <View style={styles.severityContainer}>
                <View style={styles.severityHeader}>
                  <Text style={[styles.severityValue, { color: severityColor }]}>
                    {severity}/10
                  </Text>
                  <Text style={styles.severityLabel}>{severityLabel}</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={severity}
                  onValueChange={setSeverity}
                  minimumTrackTintColor={severityColor}
                  maximumTrackTintColor={theme.colors.separator}
                  thumbTintColor={severityColor}
                />
                <View style={styles.severityLabels}>
                  <Text style={styles.severityEndLabel}>Mild</Text>
                  <Text style={styles.severityEndLabel}>Severe</Text>
                </View>
              </View>

              <Text style={styles.label}>Additional notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any observations or details..."
                placeholderTextColor={theme.colors.muted}
                value={notes}
                onChangeText={setNotes}
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
                  !selectedProblem && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || !selectedProblem}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="heart" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Log Issue</Text>
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
    severityContainer: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    severityHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    severityValue: {
      fontSize: 28,
      fontWeight: "700",
    },
    severityLabel: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    slider: {
      width: "100%",
      height: 40,
    },
    severityLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    severityEndLabel: {
      fontSize: 12,
      color: theme.colors.muted,
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

export default LogIssueScreen;

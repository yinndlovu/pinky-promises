import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Slider from "@react-native-community/slider";
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { logIssue } from "../../../services/api/period/periodService";
import {
  PeriodProblem,
  PeriodProblemLabels,
  PeriodProblemEmojis,
} from "../../../types/Period";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

const LogIssueModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();

  const [selectedProblem, setSelectedProblem] = useState<PeriodProblem | null>(null);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSeverityColor = () => {
    if (severity <= 3) return "#4caf50";
    if (severity <= 6) return "#ff9800";
    return "#f44336";
  };

  const getSeverityLabel = () => {
    if (severity <= 2) return "Very Mild";
    if (severity <= 4) return "Mild";
    if (severity <= 6) return "Moderate";
    if (severity <= 8) return "Severe";
    return "Very Severe";
  };

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

      // Reset form
      setSelectedProblem(null);
      setSeverity(5);
      setNotes("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to log issue");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProblem(null);
    setSeverity(5);
    setNotes("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Log Issue for Partner</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Problem Selection */}
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

              {/* Severity Slider */}
              <Text style={styles.label}>How severe is it?</Text>
              <View style={styles.severityContainer}>
                <View style={styles.severityHeader}>
                  <Text style={[styles.severityValue, { color: getSeverityColor() }]}>
                    {severity}/10
                  </Text>
                  <Text style={styles.severityLabel}>{getSeverityLabel()}</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={severity}
                  onValueChange={setSeverity}
                  minimumTrackTintColor={getSeverityColor()}
                  maximumTrackTintColor={theme.colors.separator}
                  thumbTintColor={getSeverityColor()}
                />
                <View style={styles.severityLabels}>
                  <Text style={styles.severityEndLabel}>Mild</Text>
                  <Text style={styles.severityEndLabel}>Severe</Text>
                </View>
              </View>

              {/* Notes Input */}
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

              {/* Error */}
              {error && (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color="#ff6b6b" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            {/* Submit Button */}
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
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    keyboardView: {
      flex: 1,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
      paddingBottom: 34,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 20,
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
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginHorizontal: 20,
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

export default LogIssueModal;


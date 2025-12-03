// external
import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { createCustomAid } from "../../../services/api/period/periodService";
import {
  PeriodProblem,
  PeriodProblemLabels,
  PeriodProblemEmojis,
} from "../../../types/Period";

// props
interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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

const AddCustomAidModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();
  const insets = useSafeAreaInsets();

  // use states
  const [selectedProblem, setSelectedProblem] = useState<PeriodProblem | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // use refs
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // use effects
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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

      setSelectedProblem(null);
      setTitle("");
      setDescription("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add custom aid");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProblem(null);
    setTitle("");
    setDescription("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <Animated.View
              style={[
                styles.container,
                {
                  paddingBottom: Math.max(insets.bottom, 20),
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Add Your Need</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
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
                          selectedProblem === problem &&
                            styles.problemTextActive,
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
                    <Text style={styles.submitButtonText}>Add to My Needs</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </BlurView>
      </Animated.View>
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

export default AddCustomAidModal;

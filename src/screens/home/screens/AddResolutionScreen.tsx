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
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { useCreateResolution } from "../../../hooks/useResolutions";
import { HomeStackParamList } from "../../../types/StackParamList";

// types
type Props = NativeStackScreenProps<HomeStackParamList, "AddResolutionScreen">;

const AddResolutionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { onSuccess } = route.params;

  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();

  // use states
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const createResolutionMutation = useCreateResolution(token);

  // handlers
  const handleSubmit = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      await createResolutionMutation.mutateAsync({
        title: title.trim(),
        dueDate: dueDate.toISOString(),
      });
      onSuccess();
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create resolution:", error);
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
              <Text style={styles.headerTitle}>Add Resolution</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Feather name="target" size={32} color={theme.colors.primary} />
                </View>
              </View>

              <Text style={styles.title}>Set a New Goal</Text>
              <Text style={styles.subtitle}>
                Create a resolution to work towards together
              </Text>

              <Text style={styles.label}>What's your resolution?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Go on a date night once a week"
                placeholderTextColor={theme.colors.muted}
                value={title}
                onChangeText={setTitle}
                autoFocus
                maxLength={200}
              />

              <Text style={styles.label}>When should it be done by?</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateButtonText}>
                  {dueDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS !== "ios") {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        setDueDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                    textColor={theme.colors.text}
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.datePickerDoneButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  )}
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
                  (!title.trim() || createResolutionMutation.isPending) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!title.trim() || createResolutionMutation.isPending}
              >
                {createResolutionMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#fff" />
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
    iconContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.muted,
      textAlign: "center",
      marginBottom: 28,
      lineHeight: 22,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    input: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 20,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    dateButtonText: {
      marginLeft: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    datePickerContainer: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      marginBottom: 20,
      overflow: "hidden",
    },
    datePickerDoneButton: {
      alignItems: "center",
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
    },
    datePickerDoneText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primary,
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

export default AddResolutionScreen;

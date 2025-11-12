// external
import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// content
import AlertModal from "../output/AlertModal";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onVerify: (password: string) => Promise<boolean>;
  loading?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");

const PasswordVerificationModal: React.FC<Props> = ({
  visible,
  onClose,
  onVerify,
  loading = false,
}) => {
  // use states
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");

  // variables
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // handlers
  const handleVerify = async () => {
    if (!password.trim()) {
      return;
    }

    try {
      const isValid = await onVerify(password.trim());
      if (isValid) {
        setPassword("");
        onClose();
      } else {
        setAlertTitle("Incorrect password");
        setAlertMessage(
          "The password you entered is incorrect. Please try again."
        );
        setShowErrorAlert(true);
      }
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        err.response?.data?.error || "Failed to verify password."
      );
      setShowErrorAlert(true);
    }
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={[styles.container, { paddingTop: insets.top + 2 }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Verify Password</Text>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (!password.trim() || loading) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleVerify}
                disabled={!password.trim() || loading}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? "Verifying..." : "Verify"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            <View style={styles.content}>
              <Text style={styles.description}>
                Please enter your password to confirm account deletion
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password..."
                  placeholderTextColor={theme.colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <AlertModal
            visible={showSuccessAlert}
            type="success"
            title={alertTitle}
            message={alertMessage || ""}
            buttonText="Great"
            onClose={() => setShowSuccessAlert(false)}
          />

          <AlertModal
            visible={showErrorAlert}
            type="error"
            title={alertTitle}
            message={alertMessage || ""}
            buttonText="Close"
            onClose={() => setShowErrorAlert(false)}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      width: screenWidth,
      height: "50%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.muted,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
      opacity: 0.6,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 20,
    },
    closeButton: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
      backgroundColor: "transparent",
    },
    closeButtonText: {
      color: theme.colors.muted,
      fontSize: 18,
      fontWeight: "bold",
    },
    title: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
      textAlign: "center",
      marginHorizontal: 16,
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      minWidth: 60,
      alignItems: "center",
    },
    verifyButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 14,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.separator,
      marginVertical: 8,
    },
    content: {
      flex: 1,
      paddingTop: 16,
    },
    description: {
      color: theme.colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
      textAlign: "center",
    },
    inputContainer: {
      position: "relative",
    },
    passwordInput: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingRight: 50,
    },
    eyeButton: {
      position: "absolute",
      right: 12,
      top: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default PasswordVerificationModal;

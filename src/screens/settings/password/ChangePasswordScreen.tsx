// external
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import { changePassword } from "../../../services/authService";

// screen content
import AlertModal from "../../../components/modals/AlertModal";

// types
type ChangePasswordScreenProps = StackScreenProps<any, any>;

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  // use states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [newPasswordValid, setNewPasswordValid] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  // validators
  const validateNewPassword = (password: string) => {
    return {
      length: password.length >= 8,
      letter: /[a-zA-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const validateConfirmPassword = (confirm: string) => {
    return confirm === newPassword && confirm.length > 0;
  };

  // use effects
  useEffect(() => {
    setNewPasswordValid(validateNewPassword(newPassword));
  }, [newPassword]);

  useEffect(() => {
    setConfirmPasswordValid(validateConfirmPassword(confirmPassword));
  }, [confirmPassword, newPassword]);

  const isFormValid = () => {
    const newPasswordAllValid = Object.values(newPasswordValid).every(Boolean);
    return (
      currentPassword.length > 0 && newPasswordAllValid && confirmPasswordValid
    );
  };

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // handlers
  const handleSave = async () => {
    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");

        return;
      }

      await changePassword(
        token,
        currentPassword,
        newPassword,
        confirmPassword
      );

      setAlertMessage("Password changed. Log in again");
      await AsyncStorage.removeItem("token");
      
      setAlertVisible(true);
      setChangeSuccess(true);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({
    valid,
    text,
  }: {
    valid: boolean;
    text: string;
  }) => (
    <View style={styles.validationItem}>
      <Feather
        name={valid ? "check" : "x"}
        size={14}
        color={valid ? "#4caf50" : "#f44336"}
      />
      <Text
        style={[
          styles.validationText,
          { color: valid ? "#4caf50" : "#f44336" },
        ]}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Current password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#b0b3c6"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Feather
                  name={showCurrentPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#b0b3c6"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>New password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#b0b3c6"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Feather
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#b0b3c6"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.validationContainer}>
              <ValidationItem
                valid={newPasswordValid.length}
                text="At least 8 characters"
              />
              <ValidationItem
                valid={newPasswordValid.letter}
                text="One letter"
              />
              <ValidationItem
                valid={newPasswordValid.number}
                text="One number"
              />
              <ValidationItem
                valid={newPasswordValid.special}
                text="One special character"
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Confirm new password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#b0b3c6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#b0b3c6"
                />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <View style={styles.validationContainer}>
                <ValidationItem
                  valid={confirmPasswordValid}
                  text="Passwords match"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isFormValid() || loading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isFormValid() || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>Changing...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Change password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);

          if (changeSuccess) {
            setChangeSuccess(false);
            navigation.navigate("Settings");
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 150,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  inputSection: {
    width: "100%",
    marginBottom: 24,
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 16,
    color: "#b0b3c6",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 12,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    borderWidth: 0,
    borderRadius: 12,
    padding: 12,
    outlineWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: 10,
  },
  validationContainer: {
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  validationText: {
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#e03487",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(224, 52, 135, 0.5)",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toast: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ChangePasswordScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";

type ChangeEmailScreenProps = StackScreenProps<any, any>;

const ChangeEmailScreen: React.FC<ChangeEmailScreenProps> = ({
  navigation,
}) => {
  const [currentEmail, setCurrentEmail] = useState("currentEmail@user.com");
  const [newEmail, setNewEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email !== currentEmail;
  };

  useEffect(() => {
    setIsValidEmail(validateEmail(newEmail));
  }, [newEmail, currentEmail]);

  const handleSave = async () => {
    if (!isValidEmail) return;

    setLoading(true);
    try {
      navigation.navigate("VerifyEmailOTP", {
        newEmail,
        currentEmail,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.currentEmailSection}>
            <Text style={styles.sectionLabel}>Current email address</Text>
            <View style={styles.currentEmailBox}>
              <Text style={styles.currentEmailText}>{currentEmail}</Text>
            </View>
          </View>

          <View style={styles.newEmailSection}>
            <Text style={styles.sectionLabel}>New email address</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter new email address"
                placeholderTextColor="#b0b3c6"
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isValidEmail || loading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isValidEmail || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>Sending...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 150,
    justifyContent: "center",
    paddingBottom: 32,
    backgroundColor: "#23243a",
  },
  contentWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  currentEmailSection: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 16,
    color: "#b0b3c6",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  currentEmailBox: {
    backgroundColor: "#1b1c2e",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  currentEmailText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  newEmailSection: {
    width: "100%",
    marginBottom: 40,
    alignItems: "center",
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 12,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  input: {
    width: "100%",
    fontSize: 16,
    color: "#fff",
    borderWidth: 0,
    borderRadius: 12,
    textAlign: "center",
    padding: 12,
    outlineWidth: 0,
  },
  saveButton: {
    backgroundColor: "#e03487",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(224, 52, 135, 0.5)",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChangeEmailScreen;

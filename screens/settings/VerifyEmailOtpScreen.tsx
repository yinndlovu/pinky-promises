import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { StackScreenProps } from '@react-navigation/stack';

type VerifyEmailOTPScreenProps = StackScreenProps<any, any>;

const VerifyEmailOtpScreen: React.FC<VerifyEmailOTPScreenProps> = ({ navigation, route }) => {
  const { newEmail, currentEmail } = route.params || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      Alert.alert(
        "Success", 
        "Email address updated successfully!", 
        [{ text: "OK", onPress: () => navigation.navigate("Settings") }]
      );
    } catch (error) {
      Alert.alert("Error", "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      setCountdown(30);
      Alert.alert("Success", "Verification code sent again!");
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Verify email address</Text>
        
        <View style={styles.contentWrapper}>
          <View style={styles.emailSection}>
            <Text style={styles.sectionLabel}>We sent a verification code to:</Text>
            <View style={styles.emailBox}>
              <Text style={styles.emailText}>{newEmail}</Text>
            </View>
          </View>

          <View style={styles.otpSection}>
            <Text style={styles.sectionLabel}>Enter verification code</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#b0b3c6"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.length !== 6 || loading) && styles.verifyButtonDisabled
            ]}
            onPress={handleVerify}
            disabled={otp.length !== 6 || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <Text style={styles.verifyButtonText}>Verifying...</Text>
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={countdown > 0 || resendLoading}
              activeOpacity={0.7}
            >
              {resendLoading ? (
                <Text style={styles.resendButtonText}>Sending...</Text>
              ) : countdown > 0 ? (
                <Text style={styles.resendButtonText}>Resend in {countdown}s</Text>
              ) : (
                <Text style={styles.resendButtonText}>Resend code</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: "center",
    backgroundColor: "#23243a",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    alignSelf: "center",
    marginBottom: 40,
  },
  contentWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emailSection: {
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
  emailBox: {
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
  emailText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  otpSection: {
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
    fontSize: 18,
    color: "#fff",
    borderWidth: 0,
    borderRadius: 12,
    padding: 12,
    outlineWidth: 0,
    textAlign: "center",
    letterSpacing: 2,
  },
  verifyButton: {
    backgroundColor: "#e03487",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: "rgba(224, 52, 135, 0.5)",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  resendSection: {
    alignItems: "center",
  },
  resendText: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: "#e03487",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default VerifyEmailOtpScreen;
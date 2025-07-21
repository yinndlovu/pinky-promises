import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";

type VerifyEmailOTPScreenProps = StackScreenProps<any, any>;

const VerifyEmailOtpScreen: React.FC<VerifyEmailOTPScreenProps> = ({
  navigation,
  route,
}) => {
  const { newEmail, currentEmail } = route.params || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      navigation.navigate("Settings", { emailChanged: true });
    } catch (error) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      setCountdown(30);
      setSuccess("Verification code sent again!");
    } catch (error) {
      setError("Failed to resend code. Please try again.");
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
            <Text style={styles.sectionLabel}>
              We sent a verification code to:
            </Text>
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
              (otp.length !== 6 || loading) && styles.verifyButtonDisabled,
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
                <Text style={styles.resendButtonText}>
                  Resend in {countdown}s
                </Text>
              ) : (
                <Text style={styles.resendButtonText}>Resend code</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}

      {showSuccess && (
        <View style={[styles.toast, { backgroundColor: "#4caf50" }]}>
          <Text style={styles.toastText}>{success}</Text>
        </View>
      )}
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

export default VerifyEmailOtpScreen;

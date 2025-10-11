// external
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import {
  verifyPin,
  resendPin,
} from "../../../services/api/auth/resetPasswordService";

// content
import AnimatedDialog from "../../../animations/AnimatedDialog";
import goodEmoji from "../../../assets/animations/good-emoji.json";
import thinkingEmoji from "../../../assets/animations/thinking-emoji.json";

type Props = NativeStackScreenProps<any>;

const PinVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  // params
  const { username } = route.params || {};

  // use states
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    "Let's see if this PIN is correct. One second..."
  );

  // handlers
  const handleVerify = async () => {
    // validations
    if (pin.trim().length === 0) {
      setError("Where is you going without entering the PIN?");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setError("I said that your PIN should be 6 digits long.");
      return;
    }

    setError("");
    setLoading(true);

    const MIN_BIRD_TIME = 3500;
    const startTime = Date.now();

    try {
      const token = await AsyncStorage.getItem("resetToken");

      if (!token) {
        setError(
          "There seems to be issues with your session. Please start over."
        );
        setLoading(false);
        return;
      }

      await verifyPin(token, pin.trim());

      const elapsed = Date.now() - startTime;

      if (elapsed < MIN_BIRD_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_BIRD_TIME - elapsed)
        );
      }

      navigation.replace("NewPassword", {
        username,
      });
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_BIRD_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_BIRD_TIME - elapsed)
        );
      }
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("Okay, let me resend the PIN. One second...");
    setLoading(true);

    const MIN_BIRD_TIME = 3500;
    const startTime = Date.now();

    try {
      const token = await AsyncStorage.getItem("resetToken");

      if (!token) {
        setError(
          "There seems to be issues with your session. Please start over."
        );
        setLoading(false);
        return;
      }

      await resendPin(token);
      const elapsed = Date.now() - startTime;

      if (elapsed < MIN_BIRD_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_BIRD_TIME - elapsed)
        );
      }

      setError("Okay, I have sent a new verification pin to the app admin.");
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_BIRD_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_BIRD_TIME - elapsed)
        );
      }

      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../assets/app_background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <AnimatedDialog
            visible={true}
            animation={thinkingEmoji}
            loop={true}
            message={message}
            mode="inline"
          />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/app_background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <AnimatedDialog
          visible={true}
          animation={goodEmoji}
          loop={true}
          message={
            error
              ? error
              : `Great! We found "${username}" in our list. Now you just need to enter the 6-digit PIN we sent to the app admin. Tell him to give it to you!`
          }
          mode="inline"
        />
        <TextInput
          style={styles.input}
          placeholder="123456"
          placeholderTextColor="#b0b3c6"
          value={pin}
          onChangeText={(text) => {
            setPin(text);
            if (error) {
              setError("Yup! Type the correct pin in there please.");
            }
          }}
          keyboardType="numeric"
          maxLength={6}
        />

        <TouchableOpacity style={styles.nextButton} onPress={handleVerify}>
          <Text style={styles.nextButtonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
          <Text style={styles.resendButtonText}>Resend PIN</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(35, 36, 58, 0.8)",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.05)",
    textAlign: "center",
    letterSpacing: 8,
  },
  nextButton: {
    backgroundColor: "#e03487",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: 12,
  },
  resendButtonText: {
    color: "#e03487",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PinVerificationScreen;

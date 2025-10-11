// external
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import { validatePassword } from "../../../validators/validatePassword";
import { resetPassword } from "../../../services/api/auth/resetPasswordService";

// content
import thinkingEmoji from "../../../assets/animations/thinking-emoji.json";
import goodEmoji from "../../../assets/animations/good-emoji.json";
import AnimatedDialog from "../../../animations/AnimatedDialog";

type Props = NativeStackScreenProps<any>;

const NewPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  // params
  const { username } = route.params || {};

  // use states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    `Nice password! Let me send it to our back-end engineer for approval. One second...`
  );

  // use effects
  useEffect(() => {
    setNewPasswordValid(validatePassword(password));
  }, [password]);

  // handlers
  const handleReset = async () => {
    setError("");

    // validations
    const { length, letter, number, special } = newPasswordValid;
    if (!special) {
      setError(
        "Invalid password. Your password must contain at least one special character, like @ or ! or ."
      );
      return;
    }

    if (!number) {
      setError("Invalid password. Your password must contain at least one number.");
      return;
    }

    if (!letter) {
      setError("Invalid password. Your password must contain at least one letter.");
      return;
    }

    if (!length) {
      setError("Invalid password. Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Invalid password. Your passwords do not match. Try again.");
      return;
    }

    const MIN_BIRD_TIME = 3500;
    const startTime = Date.now();

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("resetToken");

      if (!token) {
        setError(
          "There seems to be issues with your session. Please start over."
        );
        setLoading(false);
        return;
      }

      await resetPassword(token, password);
      const elapsed = Date.now() - startTime;

      if (elapsed < MIN_BIRD_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_BIRD_TIME - elapsed)
        );
      }

      navigation.navigate("ResetSuccess", {
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
              : `Correct PIN! Alright, lock in. Enter a new password. Enter something you will remember this time huh 😉`
          }
          mode="inline"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#b0b3c6"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) {
                setError("");
              }
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#b0b3c6"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#b0b3c6"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirm(!showConfirm)}
          >
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={24}
              color="#b0b3c6"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleReset}>
          <Text style={styles.nextButtonText}>
            {loading ? "Resetting..." : "Reset Password"}
          </Text>
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
  inputContainer: {
    width: "100%",
    marginBottom: 12,
    position: "relative",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  validationContainer: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingLeft: 8,
  },
  validationText: {
    fontSize: 14,
    marginVertical: 2,
  },
  valid: {
    color: "#00ff00",
  },
  invalid: {
    color: "#ff4d4d",
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
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
});

export default NewPasswordScreen;

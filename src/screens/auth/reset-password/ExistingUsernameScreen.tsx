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
import { initiatePasswordReset } from "../../../services/api/auth/resetPasswordService";

// content
import AnimatedDialog from "../../../animations/AnimatedDialog";
import sleepingBird from "../../../assets/animations/sleeping-bird.json";
import thinkingEmoji from "../../../assets/animations/thinking-emoji.json";

type Props = NativeStackScreenProps<any>;

const ExistingUsernameScreen: React.FC<Props> = ({ navigation }) => {
  // use states
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handlers
  const handleNext = async () => {
    if (username.trim() === "") {
      setError("Username cannot be empty.");
      return;
    }

    setError("");
    setLoading(true);

    const MIN_BIRD_TIME = 3500;
    const startTime = Date.now();

    try {
      const res = await initiatePasswordReset(username.trim().toLowerCase());
      await AsyncStorage.setItem("resetToken", res.token);

      const elapsed = Date.now() - startTime;
      
      if (elapsed < MIN_BIRD_TIME) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_BIRD_TIME - elapsed)
        );
      }

      navigation.navigate("PinVerification", {
        username: username.trim().toLowerCase(),
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
            message={`Hmm.. ${username}? Let me check if that's in my list.`}
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
          animation={sleepingBird}
          loop={true}
          message={
            error
              ? error
              : `Forgotten our password already, have we? It's fine, give me your username.`
          }
          mode="inline"
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#b0b3c6"
          value={username}
          maxLength={20}
          onChangeText={(text) => {
            setUsername(text);
            if (error) {
              setError("Yep, give me the correct username.");
            }
          }}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
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
  label: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  nextButton: {
    backgroundColor: "#e03487",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 200,
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
  apiError: {
    color: "red",
    marginTop: 12,
    textAlign: "center",
  },
});

export default ExistingUsernameScreen;

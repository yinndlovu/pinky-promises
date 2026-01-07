// external
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

// internal
import { BASE_URL } from "../../../configuration/config";

type Props = NativeStackScreenProps<any>;

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

const UsernameScreen: React.FC<Props> = ({ navigation, route }) => {
  // variables
  const { name } = route.params || {};

  // use states
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  // use refs
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // use effects
  useEffect(() => {
    if (
      !username ||
      !usernameRegex.test(username) ||
      username.length < 3 ||
      username.length > 20
    ) {
      setAvailable(null);
      setError(
        !username
          ? ""
          : username.length < 3
          ? "Username must be at least 3 characters long"
          : username.length > 20
          ? "Username must not exceed 20 characters"
          : "Username can only contain letters, numbers, underscores, and hyphens"
      );
      return;
    }

    setChecking(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/auth/validate-username?username=${encodeURIComponent(
            username
          )}`
        );

        setAvailable(res.data.available);
        setError("");
      } catch (e: any) {
        setAvailable(null);
        setError(
          e.response?.data?.error || "Error checking username availability"
        );
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [username]);

  // handlers
  const handleNext = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (trimmedUsername.length > 20) {
      setError("Username must not exceed 20 characters");
      return;
    }

    if (!usernameRegex.test(trimmedUsername)) {
      setError(
        "Username can only contain letters, numbers, underscores, and hyphens"
      );
      return;
    }

    if (available === false) {
      setError("Username is already taken");
      return;
    }
    setError("");

    navigation.navigate("Password", { name, username: trimmedUsername });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground
            source={require("../../../assets/app_background.png")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay}>
              <Text style={styles.label}>Choose a username</Text>
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor="#b0b3c6"
                value={username}
                onChangeText={setUsername}
                maxLength={20}
                autoCapitalize="none"
              />
              {checking && (
                <ActivityIndicator
                  size="small"
                  color="#e03487"
                  style={{ marginBottom: 8 }}
                />
              )}
              {!checking && available === true && username && (
                <Text style={styles.success}>You can have this username!</Text>
              )}
              {!checking && available === false && username && (
                <Text style={styles.error}>
                  You can't have this username...
                </Text>
              )}
              {!checking && error && <Text style={styles.error}>{error}</Text>}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { opacity: checking || available === false ? 0.6 : 1 },
                ]}
                onPress={handleNext}
                disabled={checking || available === false}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingTop: 120,
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
    fontSize: 14,
  },
  success: {
    color: "green",
    marginBottom: 8,
    fontSize: 14,
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

export default UsernameScreen;

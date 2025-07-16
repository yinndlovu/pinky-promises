import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

type Props = NativeStackScreenProps<any>;

const usernameRegex = /^[a-zA-Z0-9_-]+$/;

const UsernameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { name } = route.params || {};
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
          `${BASE_URL}/api/auth/validate-username?username=${encodeURIComponent(
            username
          )}`
        );

        setAvailable(res.data.available);
        setError("");
      } catch (e) {
        setAvailable(null);
        setError("Error checking username availability");
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
    <View style={styles.container}>
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
        <Text style={styles.error}>You can't have this username...</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#23243a",
    padding: 16,
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

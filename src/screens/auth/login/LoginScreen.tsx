// external
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { Feather } from "@expo/vector-icons";

// internal
import { BASE_URL } from "../../../configuration/config";
import { useAuth } from "../../../contexts/AuthContext";

type Props = NativeStackScreenProps<any>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  // use states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // variables
  const { login } = useAuth();

  // handlers
  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });

      await login(response.data.token, {
        id: response.data.userId,
        username: response.data.username,
      });

      setLoading(false);

      navigation.reset({
        index: 0,
        routes: [{ name: "Main", params: { username } }],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/app_background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.label}>Log in to your account</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { borderWidth: 0, marginBottom: 0 }]}
            placeholder="Username"
            placeholderTextColor="#b0b3c6"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={20}
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#b0b3c6"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            maxLength={32}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#b0b3c6"
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[
            styles.loginButton,
            {
              opacity: loading ? 0.6 : 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in" : "Log in"}
          </Text>
          {loading && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
        <View style={{ flexDirection: "row", marginTop: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Forgot password? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ExistingUsername")}
          >
            <Text
              style={{ color: "#e03487", fontSize: 16, fontWeight: "bold" }}
            >
              Make a new one
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 16 }}>.</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(35, 36, 58, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 14,
    padding: 6,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  input: {
    width: "100%",
    fontSize: 16,
    color: "#fff",
    borderWidth: 0,
    borderColor: "#b0b3c6",
    borderRadius: 14,
    padding: 10,
    outlineWidth: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    borderWidth: 0,
    padding: 10,
  },
  eyeButton: {
    paddingHorizontal: 10,
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontSize: 14,
  },
  loginButton: {
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
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;

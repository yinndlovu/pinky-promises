// external
import React, { useState, useEffect } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// internal
import { BASE_URL } from "../../../configuration/config";
import { useAuth } from "../../../contexts/AuthContext";
import { validatePassword } from "../../../validators/validatePassword";

type Props = NativeStackScreenProps<any>;

const PasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  // use states
  const { name, username } = route.params || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPasswordValid, setNewPasswordValid] = useState({
    length: false,
    letter: false,
    number: false,
    special: false,
  });

  // variables
  const { login } = useAuth();

  // use effects
  useEffect(() => {
    setNewPasswordValid(validatePassword(password));
  }, [password, confirmPassword]);

  // handlers
  const handleRegister = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name,
        username,
        password,
      });

      // loading false was initially here

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
      setError(err.response?.data?.error || "Registration failed");
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
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
    >
      <Feather
        name={valid ? "check" : "x"}
        size={14}
        color={valid ? "#4caf50" : "#f44336"}
      />
      <Text
        style={{
          fontSize: 13,
          marginLeft: 8,
          fontWeight: "500",
          color: valid ? "#4caf50" : "#f44336",
        }}
      >
        {text}
      </Text>
    </View>
  );

  const isFormValid =
    Object.values(newPasswordValid).every(Boolean) &&
    password === confirmPassword &&
    password.length > 0;

  return (
    <ImageBackground
      source={require("../../../assets/app_background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={100}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.overlay}>
            <Text style={styles.label}>Type matching passwords</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#b0b0b0"
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
                  size={22}
                  color="#b0b3c6"
                />
              </TouchableOpacity>
            </View>
            <View
              style={{ width: "100%", marginBottom: 8, paddingHorizontal: 8 }}
            >
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
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#b0b0b0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                maxLength={32}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirm((v) => !v)}
              >
                <Feather
                  name={showConfirm ? "eye-off" : "eye"}
                  size={20}
                  color="#b0b3c6"
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && (
              <View
                style={{ width: "100%", marginBottom: 8, paddingHorizontal: 8 }}
              >
                <ValidationItem
                  valid={password === confirmPassword}
                  text="Passwords match"
                />
              </View>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[
                styles.registerButton,
                {
                  opacity: !isFormValid || loading ? 0.6 : 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={handleRegister}
              disabled={!isFormValid || loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Registering" : "Register"}
              </Text>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "rgba(35, 36, 58, 0.8)",
  },
  overlay: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
    paddingTop: 80,
    paddingBottom: 40,
  },
  label: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 16,
    fontWeight: "bold",
  },
  success: {
    color: "green",
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    outlineWidth: 0,
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontSize: 14,
  },
  registerButton: {
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
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PasswordScreen;

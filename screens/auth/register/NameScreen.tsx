import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any>;

const NameScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (name.trim().length === 0) {
      setError("Name is required");
      return;
    }
    
    if (name.length > 25) {
      setError("Name must not exceed 25 characters");
      return;
    }
    setError("");

    navigation.navigate("Username", { name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What's your name?</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor="#b0b3c6"
        value={name}
        onChangeText={setName}
        maxLength={25}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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

export default NameScreen;

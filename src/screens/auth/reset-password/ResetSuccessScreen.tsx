// external
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// content
import AnimatedDialog from "../../../animations/AnimatedDialog";
import catTyping from "../../../assets/animations/cat-typing.json";
import sleepingBird from "../../../assets/animations/sleeping-bird.json";

type Props = NativeStackScreenProps<any>;

const ResetSuccessScreen: React.FC<Props> = ({ navigation }) => {
  // use states
  const [storing, setStoring] = useState(true);

  // use effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setStoring(false);
    }, 8500);

    return () => clearTimeout(timer);
  }, []);

  // handlers
  const handleGoToLogin = () => {
    navigation.replace("Login");
  };

  if (storing) {
    return (
      <ImageBackground
        source={require("../../../assets/app_background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <AnimatedDialog
            visible={true}
            animation={catTyping}
            loop={true}
            message="Hi, I'm Bob! Your back-end engineer. Give me a moment to just safely store your new password into my database."
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
            "All done! You can now log in with your new password. Remember to keep it safe this time!"
          }
          mode="inline"
        />

        <TouchableOpacity style={styles.nextButton} onPress={handleGoToLogin}>
          <Text style={styles.nextButtonText}>Go to Login</Text>
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
    fontSize: 24,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  subLabel: {
    fontSize: 16,
    color: "#b0b3c6",
    marginBottom: 24,
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

export default ResetSuccessScreen;

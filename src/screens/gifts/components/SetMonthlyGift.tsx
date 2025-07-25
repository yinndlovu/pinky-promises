// external
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// internal
import { SetMonthlyGiftProps } from "../../../types/Gift";

const SetMonthlyGift: React.FC<SetMonthlyGiftProps> = ({
  giftName,
  onChange,
  buttonText = "Change",
}) => (
  <View style={styles.card}>
    <Text style={styles.tip}>YOUR FAVORITE PRESENT</Text>
    <Text style={styles.giftName}>{giftName}</Text>
    <TouchableOpacity style={styles.changeButton} onPress={onChange}>
      <Text style={styles.changeButtonText}>{buttonText}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tip: {
    fontSize: 13,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: "bold",
  },
  giftName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  changeButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  changeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default SetMonthlyGift;

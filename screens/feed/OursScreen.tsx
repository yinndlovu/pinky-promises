import React from "react";
import { View, Text, StyleSheet } from "react-native";

const OursScreen = () => (
  <View style={styles.centered}>
    <Text style={styles.tabText}>Ours</Text>
  </View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#23243a",
  },
  tabText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});

export default OursScreen;

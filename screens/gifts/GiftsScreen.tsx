import React from "react";
import { View, Text, StyleSheet } from "react-native";

const GiftsScreen = () => (
  <View style={styles.centered}>
    <Text style={styles.tabText}>Gifts (dummy)</Text>
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

export default GiftsScreen;

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import aboutText from "../../../configuration/aboutText";

const AboutScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#23243a" }}
      contentContainerStyle={{
        padding: 24,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>About Pinky Promises</Text>
      <Text style={styles.body}>{aboutText}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e03487",
    marginBottom: 18,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    textAlign: "left",
  },
});

export default AboutScreen;

// external
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// types
type Props = {
  about?: string;
};

const PartnerMoreAboutYou: React.FC<Props> = ({
  about = "",
}) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.label}>More about you</Text>
    </View>
    <View style={styles.valueRow}>
      {!about ? (
        <Text style={styles.noInfoText}>No info added yet</Text>
      ) : (
        <Text style={styles.value}>{about}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  noInfoText: {
    color: "#b0b3c6",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 0,
  },
});

export default PartnerMoreAboutYou;

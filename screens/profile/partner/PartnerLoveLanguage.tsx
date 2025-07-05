import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  loveLanguage?: string;
};

const PartnerLoveLanguage: React.FC<Props> = ({
  loveLanguage = "Not set",
}) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.label}>Love language</Text>
    </View>
    <View style={styles.valueRow}>
      <Text style={loveLanguage ? styles.value : styles.noValue}>
        {loveLanguage ? loveLanguage : "No love language added"}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 18,
    marginTop: 20
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  row: {
    marginTop: 0,
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
  noValue: {
    color: "#b0b3c6",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default PartnerLoveLanguage;

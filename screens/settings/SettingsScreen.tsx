import React from "react";
import { View, Text } from "react-native";

const SettingsScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#23243a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
        Settings
      </Text>
      <Text style={{ color: "#b0b3c6", marginTop: 8 }}>
        This is a placeholder for settings options.
      </Text>
    </View>
  );
}

export default SettingsScreen;
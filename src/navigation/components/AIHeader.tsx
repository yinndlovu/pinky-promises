// external
import { View, Text, Image } from "react-native";

export default function AIHeader() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={require("../../assets/ai_icon.png")}
        style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }}
      />
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
        Lily
      </Text>
    </View>
  );
}

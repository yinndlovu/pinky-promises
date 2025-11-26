// external
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";

// internal
import { useTheme } from "../../theme/ThemeContext";

const ErrorState = ({ message, onRetry }: any) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onRetry}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        padding: 20,
      }}
    >
      <Feather name="refresh-ccw" size={45} color={theme.colors.text} />
      <Text
        style={{
          marginTop: 15,
          fontSize: 15,
          color: theme.colors.text,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </TouchableOpacity>
  );
};

export default ErrorState;

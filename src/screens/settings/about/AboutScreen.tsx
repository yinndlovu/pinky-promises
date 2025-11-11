// external
import { useMemo } from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import aboutText from "../../../configuration/aboutText";
import { useTheme } from "../../../theme/ThemeContext";

const AboutScreen = () => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
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

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    header: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.colors.accent,
      marginBottom: 18,
      textAlign: "center",
    },
    body: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      textAlign: "left",
    },
  });

export default AboutScreen;

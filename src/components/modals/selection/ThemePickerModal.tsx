// external
import { useMemo } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  value: "system" | "light" | "dark";
  onChange: (v: "system" | "light" | "dark") => void;
};

export default function ThemePickerModal({
  visible,
  onClose,
  value,
  onChange,
}: Props) {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const options: Array<{ label: string; value: Props["value"] }> = [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>CHOOSE A THEME</Text>
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              style={styles.row}
              onPress={() => onChange(opt.value)}
            >
              <Text
                style={[styles.label, value === opt.value && styles.selected]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      padding: 24,
    },
    sheet: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
    },
    title: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 20,
      marginBottom: 12,
      textAlign: "center",
    },
    row: {
      paddingVertical: 12,
    },
    label: {
      color: theme.colors.text,
      fontSize: 15,
      textAlign: "center",
    },
    selected: {
      color: theme.colors.accent,
      fontWeight: "bold",
    },
    close: {
      marginTop: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      borderRadius: 8,
    },
    closeText: {
      color: theme.colors.text,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

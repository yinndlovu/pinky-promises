import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

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
          <Text style={styles.title}>Theme</Text>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: "#2e2f4a",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    paddingVertical: 12,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
  selected: {
    color: "#e03487",
    fontWeight: "bold",
  },
  close: {
    marginTop: 8,
    backgroundColor: "#e03487",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

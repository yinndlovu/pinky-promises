import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  initialGiftName?: string;
  onClose: () => void;
  onSave: (giftName: string) => Promise<void>;
  loading?: boolean;
};

const UpdateMonthlyGiftModal: React.FC<Props> = ({
  visible,
  initialGiftName = "",
  onClose,
  onSave,
  loading = false,
}) => {
  const [giftName, setGiftName] = useState(initialGiftName);

  React.useEffect(() => {
    setGiftName(initialGiftName);
  }, [visible, initialGiftName]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {initialGiftName
                  ? "Edit your favorite present"
                  : "Add your favorite present"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={loading}
              >
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Present name</Text>
              <TextInput
                style={styles.input}
                value={giftName}
                onChangeText={setGiftName}
                placeholder="e.g., Spotify gift card"
                placeholderTextColor="#b0b3c6"
                maxLength={50}
                editable={!loading}
              />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!giftName.trim() || loading) && styles.saveButtonDisabled,
                ]}
                onPress={() => onSave(giftName.trim())}
                disabled={!giftName.trim() || loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Saving..." : initialGiftName ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#e03487" />
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  form: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#18192b",
    color: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#393a4a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b0b3c6",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#b0b3c6",
    fontWeight: "bold",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
});

export default UpdateMonthlyGiftModal;

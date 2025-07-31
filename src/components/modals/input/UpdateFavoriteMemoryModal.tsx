// ... existing code ...
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import AlertModal from "../output/AlertModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (memory: string, date: string) => Promise<void>;
  initialMemory?: string;
  initialDate?: string;
  isEditing?: boolean;
  loading?: boolean;
};

const UpdateFavoriteMemoryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialMemory = "",
  initialDate = "",
  isEditing = false,
  loading = false,
}) => {
  const [memory, setMemory] = useState(initialMemory);
  const [date, setDate] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (visible) {
      setMemory(initialMemory);
      setDate(initialDate ? new Date(initialDate) : new Date());
    }
  }, [visible, initialMemory, initialDate]);

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleSave = async () => {
    if (!memory || !date) {
      setAlertMessage("Memory and date are required.");
      setAlertVisible(true);

      return;
    }
    try {
      const formattedDate = date.toISOString().split("T")[0];
      await onSave(memory, formattedDate);

      onClose();
    } catch (err) {
      setAlertMessage("Failed to save memory.");
      setAlertVisible(true);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    if (!loading) {
      setShowDatePicker(true);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditing ? "Edit" : "Add"} favorite memory
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showDatePickerModal}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Feather name="calendar" size={20} color="#e03487" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Memory</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memory}
              onChangeText={setMemory}
              placeholder="Describe your memory"
              placeholderTextColor="#b0b3c6"
              multiline
              numberOfLines={6}
              editable={!loading}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#e03487" />
            </View>
          )}
          <AlertModal
            visible={alertVisible}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
            style={Platform.OS === "ios" ? styles.iosDatePicker : undefined}
          />
        )}
      </View>
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
    padding: 24,
    alignItems: "center",
    width: "90%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    alignSelf: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    color: "#b0b3c6",
    fontSize: 15,
    marginBottom: 4,
    marginLeft: 2,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#393a4a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    backgroundColor: "#393a4a",
    color: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#393a4a",
    marginBottom: 14,
    width: "100%",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: "#e03487",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#393a4a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  iosDatePicker: {
    backgroundColor: "#23243a",
    width: "100%",
  },
});

export default UpdateFavoriteMemoryModal;

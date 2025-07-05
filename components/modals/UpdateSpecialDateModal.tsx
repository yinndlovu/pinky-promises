import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

type UpdateSpecialDateModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (date: string, title: string, description?: string) => void;
  initialDate?: string;
  initialTitle?: string;
  initialDescription?: string;
  isEditing?: boolean;
};

const UpdateSpecialDateModal: React.FC<UpdateSpecialDateModalProps> = ({
  visible,
  onClose,
  onSave,
  initialDate,
  initialTitle = "",
  initialDescription = "",
  isEditing = false,
}) => {
  const [date, setDate] = useState<Date>(initialDate ? new Date(initialDate) : new Date());
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    onSave(formattedDate, title.trim(), description.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setDate(new Date());
    setTitle("");
    setDescription("");
    setShowDatePicker(false);
    onClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Edit Special Date" : "Add Special Date"}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={showDatePickerModal}
              >
                <Text style={styles.dateButtonText}>
                  {date.toLocaleDateString()}
                </Text>
                <Feather name="calendar" size={20} color="#e03487" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Anniversary, Day we met"
                placeholderTextColor="#b0b3c6"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description..."
                placeholderTextColor="#b0b3c6"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
            style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
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
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#b0b3c6",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1b1c2e",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#393a4a",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#1b1c2e",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#393a4a",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#393a4a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#666",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  iosDatePicker: {
    backgroundColor: "#23243a",
    borderRadius: 8,
    marginTop: 10,
  },
});

export default UpdateSpecialDateModal;

// external
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import ModalSelector from "react-native-modal-selector";

// content
import AlertModal from "../output/AlertModal";

// options
const MOOD_OPTIONS = [
  "Happy",
  "Excited",
  "Content",
  "Sad",
  "Unhappy",
  "Angry",
  "Annoyed",
  "Irritated",
  "Very happy",
  "Crying",
  "Neutral",
];

// types
type UpdateMoodModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (mood: string) => void;
  initialMood?: string;
  saving: boolean;
};

const UpdateMoodModal: React.FC<UpdateMoodModalProps> = ({
  visible,
  onClose,
  onSave,
  initialMood = "happy",
  saving,
}) => {
  // use states
  const [selectedMood, setSelectedMood] = useState(initialMood);

  // use effects
  useEffect(() => {
    if (visible) {
      setSelectedMood(initialMood);
    }
  }, [visible, initialMood]);

  // helpers
  const data = MOOD_OPTIONS.map((mood) => ({
    key: mood,
    label: mood.charAt(0).toUpperCase() + mood.slice(1),
  }));

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update your mood</Text>
            <ModalSelector
              data={data}
              initValue={
                selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)
              }
              onChange={(option) => setSelectedMood(option.key)}
              style={styles.selector}
              selectStyle={styles.selectStyle}
              selectTextStyle={styles.selectTextStyle}
              optionTextStyle={styles.optionTextStyle}
              optionContainerStyle={styles.optionContainerStyle}
              cancelStyle={styles.cancelStyle}
              cancelTextStyle={styles.cancelTextStyle}
              backdropPressToClose={true}
              animationType="fade"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.5 }]}
                onPress={() => onSave(selectedMood)}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {saving && (
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    alignSelf: "center",
  },
  selector: {
    width: "100%",
    marginBottom: 24,
  },
  selectStyle: {
    backgroundColor: "#393a4a",
    borderRadius: 10,
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectTextStyle: {
    color: "#fff",
    fontSize: 16,
  },
  optionTextStyle: {
    color: "#fff",
    fontSize: 16,
  },
  optionContainerStyle: {
    backgroundColor: "#23243a",
    borderRadius: 10,
  },
  cancelStyle: {
    backgroundColor: "#e03487",
    borderRadius: 10,
  },
  cancelTextStyle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
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
});

export default UpdateMoodModal;

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback
} from "react-native";
import ModalSelector from "react-native-modal-selector";
import AlertModal from "./output-modals/AlertModal";

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

type UpdateMoodModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (mood: string) => void;
  initialMood?: string;
};

const UpdateMoodModal: React.FC<UpdateMoodModalProps> = ({
  visible,
  onClose,
  onSave,
  initialMood = "happy",
}) => {
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  React.useEffect(() => {
    if (visible) {
      setSelectedMood(initialMood);
    }
  }, [visible, initialMood]);

  const data = MOOD_OPTIONS.map((mood) => ({
    key: mood,
    label: mood.charAt(0).toUpperCase() + mood.slice(1),
  }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(selectedMood);
      
      setAlertMessage("Mood updated!");
      setAlertVisible(true);
    } catch (err) {
      setAlertMessage("Failed to update mood");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

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
              style={styles.saveButton}
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
            onClose={() => {
              setAlertVisible(false);
              if (alertMessage === "Mood updated!") onClose();
            }}
          />
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
    backgroundColor: "transparent",
    borderColor: "#e03487",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#e03487",
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

// external
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";

// content
import AlertModal from "../output/AlertModal";

// types
type UpdateLoveLanguageModalProps = {
  visible: boolean;
  initialLoveLanguage: string;
  onClose: () => void;
  onSave: (loveLanguage: string) => Promise<void>;
};

const UpdateLoveLanguageModal: React.FC<UpdateLoveLanguageModalProps> = ({
  visible,
  initialLoveLanguage,
  onClose,
  onSave,
}) => {
  // use states
  const [loveLanguage, setLoveLanguage] = useState(initialLoveLanguage || "");
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // use effects
  useEffect(() => {
    if (visible) {
      setLoveLanguage(initialLoveLanguage || "");
    }
  }, [visible, initialLoveLanguage]);

  // handlers
  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(loveLanguage);

      setAlertTitle("Love language updated");
      setAlertMessage("You have updated your love language.");
      setShowSuccessAlert(true);
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        err.response?.data?.error || "Failed to update love language."
      );
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>Update love language</Text>
            <TextInput
              style={styles.input}
              value={loveLanguage}
              onChangeText={setLoveLanguage}
              placeholder="Enter your love language"
              placeholderTextColor="#b0b3c6"
              editable={!loading}
            />
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
              visible={showSuccessAlert}
              type="success"
              title={alertTitle}
              message={alertMessage}
              buttonText="Great"
              onClose={() => setShowSuccessAlert(false)}
            />

            <AlertModal
              visible={showErrorAlert}
              type="error"
              title={alertTitle}
              message={alertMessage}
              buttonText="Close"
              onClose={() => setShowErrorAlert(false)}
            />
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
    padding: 24,
    alignItems: "center",
    width: "90%",
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
  input: {
    backgroundColor: "#393a4a",
    color: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#393a4a",
    width: "100%",
    marginBottom: 24,
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

export default UpdateLoveLanguageModal;

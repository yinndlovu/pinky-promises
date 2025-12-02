// external
import React, { useState, useEffect, useMemo } from "react";
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

// internal
import { useTheme } from "../../../theme/ThemeContext";

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
  "Nervous"
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
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      width: "90%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 16,
      alignSelf: "center",
    },
    selector: {
      width: "100%",
      marginBottom: 24,
    },
    selectStyle: {
      backgroundColor: theme.colors.separator,
      borderRadius: 10,
      borderWidth: 0,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    selectTextStyle: {
      color: theme.colors.text,
      fontSize: 16,
    },
    optionTextStyle: {
      color: theme.colors.text,
      fontSize: 16,
    },
    optionContainerStyle: {
      backgroundColor: theme.colors.background,
      borderRadius: 10,
    },
    cancelStyle: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
    },
    cancelTextStyle: {
      color: theme.colors.text,
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
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    cancelButton: {
      backgroundColor: theme.colors.cancelButton,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginLeft: 8,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default UpdateMoodModal;

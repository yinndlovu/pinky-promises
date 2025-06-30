import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectNew: () => void;
  onViewCurrent: () => void;
};

const ProfilePictureModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectNew,
  onViewCurrent,
}) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.handle} />
        <TouchableOpacity style={styles.option} onPress={onSelectNew}>
          <Feather name="camera" size={24} color="#e03487" />
          <Text style={styles.optionText}>Select new picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={onViewCurrent}>
          <Feather name="eye" size={24} color="#e03487" />
          <Text style={styles.optionText}>View current picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#23243a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#b0b3c6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
    opacity: 0.6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 16,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(176, 179, 198, 0.1)",
  },
  cancelText: {
    color: "#b0b3c6",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProfilePictureModal;

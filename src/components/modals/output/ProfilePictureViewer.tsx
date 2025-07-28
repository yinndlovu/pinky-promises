// external
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

// internal
import { ProfilePictureViewerProps } from "../../../types/ProfilePicture";


const ProfilePictureViewer: React.FC<ProfilePictureViewerProps> = ({
  visible,
  imageUri,
  onClose,
}) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={imageUri || require("../../assets/default-avatar-two.png")}
            style={styles.fullImage}
            contentFit="contain"
            transition={200}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 3, 12, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: -50,
    right: 0,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});

export default ProfilePictureViewer;

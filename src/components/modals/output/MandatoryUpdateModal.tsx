// external
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { AppVersionInfo } from "../../../services/api/app-version/appVersionService";

interface MandatoryUpdateModalProps {
  visible: boolean;
  versionInfo: AppVersionInfo | null;
}

const MandatoryUpdateModal: React.FC<MandatoryUpdateModalProps> = ({
  visible,
  versionInfo,
}) => {
  // variables
  const styles = createStyles();

  const handleUpdate = () => {
    if (!versionInfo) {
      return;
    }

    Alert.alert(
      "Update Required",
      `Version ${
        versionInfo.version
      } is required to continue using the app.\n\n${
        versionInfo.notes || "Bug fixes and improvements."
      }`,
      [
        {
          text: "Update Now",
          onPress: () => {
            Linking.openURL(versionInfo.downloadUrl).catch(() => {
              Alert.alert("Error", "Could not open the download link");
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!versionInfo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="alert-circle" size={64} color="#6366f1" />
          </View>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.subtitle}>
            A new version of the app is available and required to continue.
          </Text>
          <Text style={styles.versionText}>Version {versionInfo.version}</Text>
          {versionInfo.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>What's New:</Text>
              <Text style={styles.notesText}>{versionInfo.notes}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Feather
              name="download"
              size={20}
              color="#ffffff"
              style={styles.updateIcon}
            />
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = () =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
      elevation: 10,
    },
    content: {
      backgroundColor: "#ffffff",
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      width: "85%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },
    iconContainer: {
      marginBottom: 20,
    },
    title: {
      color: "#1a1a1a",
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: "center",
    },
    subtitle: {
      color: "#4a4a4a",
      fontSize: 16,
      marginBottom: 8,
      textAlign: "center",
      opacity: 0.9,
    },
    versionText: {
      color: "#6366f1",
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 20,
    },
    notesContainer: {
      width: "100%",
      marginBottom: 24,
      padding: 16,
      backgroundColor: "#f5f5f5",
      borderRadius: 12,
    },
    notesTitle: {
      color: "#1a1a1a",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    notesText: {
      color: "#4a4a4a",
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.9,
    },
    updateButton: {
      backgroundColor: "#6366f1",
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    updateIcon: {
      marginRight: 8,
    },
    updateButtonText: {
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: 18,
    },
  });

export default MandatoryUpdateModal;

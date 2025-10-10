import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppVersionInfo } from "../../services/api/app-version/appVersionService";

interface VersionUpdateBannerProps {
  versionInfo: AppVersionInfo;
  onDismiss: () => void;
}

export default function VersionUpdateBanner({
  versionInfo,
  onDismiss,
}: VersionUpdateBannerProps) {
  const handleUpdate = () => {
    Alert.alert(
      "Update Available",
      `Version ${versionInfo.version} is available.\n\n${
        versionInfo.notes || "Bug fixes and improvements."
      }`,
      [
        { text: "Later", style: "cancel" },
        {
          text: "Update",
          onPress: () => {
            Linking.openURL(versionInfo.downloadUrl).catch(() => {
              Alert.alert("Error", "Could not open the download link");
            });
          },
        },
      ]
    );
  };

  if (versionInfo.mandatory) {
    return (
      <View style={[styles.banner, styles.mandatoryBanner]}>
        <View style={styles.content}>
          <Feather
            name="alert-circle"
            size={20}
            color="#fff"
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Update Required</Text>
            <Text style={styles.subtitle}>
              Version {versionInfo.version} is available
            </Text>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.optionalBanner]}>
      <View style={styles.content}>
        <Feather name="download" size={18} color="#fff" style={styles.icon} />
        <TouchableOpacity style={styles.textContainer} onPress={handleUpdate}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.subtitle}>Version {versionInfo.version}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Feather name="x" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
  },
  mandatoryBanner: {
    backgroundColor: "#e03487",
  },
  optionalBanner: {
    backgroundColor: "#4a4a6a",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  updateButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

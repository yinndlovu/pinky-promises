// external
import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import { requestLocationPermissions } from "../../../services/location/locationPermissionService";

type AddLocationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: { latitude: number; longitude: number }) => void;
  saving?: boolean;
};

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  saving = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          await requestLocationPermissions();

          let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
          });
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (e: any) {
          if (e.message?.includes("permission denied")) {
            setError(
              "Location permission denied. Please enable location access in your device settings."
            );
          } else if (e.message?.includes("timeout")) {
            setError("Location request timed out. Please try again.");
          } else {
            setError(
              "Failed to get location. Please check your GPS and try again."
            );
          }
        }
        setLoading(false);
      })();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Your current location</Text>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Button title="Stop" onPress={onClose} color={theme.colors.primary} />
            </>
          ) : error ? (
            <>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Close" onPress={onClose} color={theme.colors.primary} />
            </>
          ) : location ? (
            <>
              <MapView
                style={styles.map}
                region={{
                  ...location,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                pointerEvents="none"
              >
                <Marker coordinate={location} />
              </MapView>
              <Text style={styles.coordsText}>
                Lat: {location.latitude.toFixed(5)}, Lng:{" "}
                {location.longitude.toFixed(5)}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.confirmButton, saving && { opacity: 0.5 }]}
                  disabled={saving}
                  onPress={() => location && onConfirm(location)}
                >
                  <Text style={styles.confirmButtonText}>
                    {saving ? "Saving..." : "Confirm"}
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
            </>
          ) : null}
          {!loading && !location && !error && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    errorText: {
      color: theme.colors.accent,
      fontWeight: "bold",
      marginVertical: 16,
      textAlign: "center",
    },
    map: {
      width: 300,
      height: 220,
      borderRadius: 12,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: theme.colors.separator,
      overflow: "hidden",
    },
    coordsText: {
      color: theme.colors.muted,
      fontSize: 15,
      marginBottom: 16,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 8,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    confirmButtonText: {
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

export default AddLocationModal;

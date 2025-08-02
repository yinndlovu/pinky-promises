// external
import React, { useEffect, useState } from "react";
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

// content
import AlertModal from "../output/AlertModal";

// internal
import {
  requestLocationPermissions,
  startBackgroundLocationTracking,
} from "../../../services/location/locationPermissionService";

type AddLocationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: { latitude: number; longitude: number }) => void;
};

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (visible) {
      (async () => {
        setLoading(true);
        setError(null);
        setSaving(false);
        setAlertVisible(false);
        setAlertMessage("");
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
            setError("Location permission denied. Please enable location access in your device settings.");
          } else if (e.message?.includes("timeout")) {
            setError("Location request timed out. Please try again.");
          } else {
            setError("Failed to get location. Please check your GPS and try again.");
          }
        }
        setLoading(false);
      })();
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!location) {
      return;
    }

    setSaving(true);
    try {
      await startBackgroundLocationTracking();

      onConfirm(location);
      setAlertMessage("Home location added");
      setAlertVisible(true);
    } catch (e) {
      setAlertMessage("Failed to add location");
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Your current location</Text>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#e03487" />
              <Button title="Stop" onPress={onClose} color="#e03487" />
            </>
          ) : error ? (
            <>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Close" onPress={onClose} color="#e03487" />
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
                  onPress={handleConfirm}
                  disabled={saving}
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
          {saving && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#e03487" />
            </View>
          )}
          <AlertModal
            visible={alertVisible}
            message={alertMessage}
            onClose={() => {
              setAlertVisible(false);
              if (alertMessage === "Home location added!") onClose();
            }}
          />
        </View>
      </View>
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
  errorText: {
    color: "#e03487",
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
    borderColor: "#393a4a",
    overflow: "hidden",
  },
  coordsText: {
    color: "#b0b3c6",
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
    backgroundColor: "#e03487",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  confirmButtonText: {
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

export default AddLocationModal;

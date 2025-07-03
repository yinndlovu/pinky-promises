import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setError("Permission to access location was denied");
            setLoading(false);
            return;
          }
          let loc = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (e) {
          setError("Failed to get location");
        }
        setLoading(false);
      })();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Your current location</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#e03487" />
          ) : error ? (
            <Text style={{ color: "red" }}>{error}</Text>
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
              <Text>
                Lat: {location.latitude.toFixed(5)}, Lng:{" "}
                {location.longitude.toFixed(5)}
              </Text>
              <Button title="Confirm" onPress={() => onConfirm(location)} />
            </>
          ) : null}
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "90%",
  },
  title: { fontSize: 18, fontWeight: "bold", margin: 10 },
  map: { width: 300, height: 250, marginVertical: 20 },
});

export default AddLocationModal;

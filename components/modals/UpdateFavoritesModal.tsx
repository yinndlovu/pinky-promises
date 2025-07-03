import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import AlertModal from "./AlertModal";

const FAVORITE_FIELDS = [
  { key: "favoriteColor", label: "Favorite Color" },
  { key: "favoriteFood", label: "Favorite Food" },
  { key: "favoriteSnack", label: "Favorite Snack" },
  { key: "favoriteActivity", label: "Favorite Activity" },
  { key: "favoriteHoliday", label: "Favorite Holiday" },
  { key: "favoriteTimeOfDay", label: "Favorite Time of Day" },
  { key: "favoriteSeason", label: "Favorite Season" },
  { key: "favoriteAnimal", label: "Favorite Animal" },
  { key: "favoriteDrink", label: "Favorite Drink" },
  { key: "favoritePet", label: "Favorite Pet" },
  { key: "favoriteShow", label: "Favorite Show" },
];

type Favorites = { [key: string]: string };

type UpdateFavoritesModalProps = {
  visible: boolean;
  initialFavorites: Favorites;
  onClose: () => void;
  onSave: (favorites: Favorites) => Promise<void>;
};

const UpdateFavoritesModal: React.FC<UpdateFavoritesModalProps> = ({
  visible,
  initialFavorites,
  onClose,
  onSave,
}) => {
  const [favorites, setFavorites] = useState<Favorites>(initialFavorites || {});
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (visible) setFavorites(initialFavorites || {});
  }, [visible, initialFavorites]);

  const handleChange = (key: string, value: string) => {
    setFavorites((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(favorites);
      setAlertMessage("Favorites updated!");
      setAlertVisible(true);
    } catch (err) {
      setAlertMessage("Failed to update favorites");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Update Favorites</Text>
          <ScrollView style={{ width: "100%" }} contentContainerStyle={{ paddingBottom: 16 }}>
            {FAVORITE_FIELDS.map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={favorites[field.key] || ""}
                  onChangeText={(text) => handleChange(field.key, text)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  placeholderTextColor="#b0b3c6"
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
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
              if (alertMessage === "Favorites updated!") onClose();
            }}
          />
        </View>
      </View>
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
    maxHeight: "90%",
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
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: "#b0b3c6",
    fontSize: 15,
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#393a4a",
    color: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#393a4a",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
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

export default UpdateFavoritesModal;

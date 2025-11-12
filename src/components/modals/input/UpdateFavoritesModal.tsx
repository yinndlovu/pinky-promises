// external
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// helpers
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

// types
type Favorites = { [key: string]: string };

type UpdateFavoritesModalProps = {
  visible: boolean;
  loading: boolean;
  initialFavorites: Favorites;
  onClose: () => void;
  onSave: (favorites: Favorites) => Promise<void>;
};

const UpdateFavoritesModal: React.FC<UpdateFavoritesModalProps> = ({
  visible,
  loading,
  initialFavorites,
  onClose,
  onSave,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [favorites, setFavorites] = useState<Favorites>(initialFavorites || {});

  // use effects
  useEffect(() => {
    if (visible) {
      setFavorites(initialFavorites || {});
    }
  }, [visible, initialFavorites]);

  // handlers
  const handleChange = (key: string, value: string) => {
    setFavorites((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Update your favorites</Text>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {FAVORITE_FIELDS.map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={favorites[field.key] || ""}
                  onChangeText={(text) => handleChange(field.key, text)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.5 }]}
              onPress={() => onSave(favorites)}
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
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      width: "90%",
      maxHeight: "90%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
      position: "relative",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 16,
      alignSelf: "center",
    },
    inputGroup: {
      marginBottom: 14,
    },
    label: {
      color: theme.colors.text,
      fontSize: 15,
      marginBottom: 4,
      marginLeft: 2,
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 12,
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

export default UpdateFavoritesModal;

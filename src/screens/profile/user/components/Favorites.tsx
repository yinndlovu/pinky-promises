// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { FavoritesProps } from "../../../../types/Favorites";
import { useTheme } from "../../../../theme/ThemeContext";

const Favorites: React.FC<FavoritesProps> = ({ favorites, onEdit }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const rows = [];
  for (let i = 0; i < favorites.length; i += 2) {
    rows.push(favorites.slice(i, i + 2));
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Favorites</Text>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Feather name="edit-2" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>No favorites added</Text>
      ) : (
        rows.map((row, idx) => (
          <View style={styles.row} key={idx}>
            {row.map((item, colIdx) => (
              <View style={styles.item} key={colIdx}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.value}</Text>
              </View>
            ))}
            {row.length === 1 && <View style={styles.item} />}
          </View>
        ))
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 0,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
    },
    editButton: {
      backgroundColor: "transparent",
      borderRadius: 8,
      padding: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      width: "100%",
      height: 1,
      backgroundColor: theme.colors.separator,
      marginBottom: 12,
      opacity: 0.7,
    },
    row: {
      flexDirection: "row",
      marginBottom: 16,
    },
    item: {
      flex: 1,
      marginRight: 12,
    },
    label: {
      fontSize: 14,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 2,
    },
    value: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "bold",
      marginBottom: 2,
    },
    noFavoritesText: {
      color: theme.colors.muted,
      fontSize: 16,
      textAlign: "center",
      marginVertical: 16,
    },
  });

export default Favorites;

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

type FavoriteItem = {
    label: string;
    value: string;
};

type Props = {
    favorites: FavoriteItem[];
    onEdit?: () => void;
};

const Favorites: React.FC<Props> = ({ favorites, onEdit }) => {
    const rows = [];
    for (let i = 0; i < favorites.length; i += 2) {
        rows.push(favorites.slice(i, i + 2));
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Favorites</Text>
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                    <Feather name="edit-2" size={18} color="#e03487" />
                </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            {rows.map((row, idx) => (
                <View style={styles.row} key={idx}>
                    {row.map((item, colIdx) => (
                        <View style={styles.item} key={colIdx}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={styles.value}>{item.value}</Text>
                        </View>
                    ))}
                    {row.length === 1 && <View style={styles.item} />}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
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
        color: "#b0b3c6",
        fontWeight: "bold",
        letterSpacing: 1,
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
        backgroundColor: "#393a4a",
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
        color: "#b0b3c6",
        fontWeight: "bold",
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 2,
    },
});

export default Favorites;

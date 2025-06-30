import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

type Memory = {
  id: string;
  text: string;
};

type Props = {
  memories: Memory[];
  onViewAll?: () => void;
};

const FavoriteMemories: React.FC<Props> = ({ memories, onViewAll }) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Favorite memories</Text>
      <TouchableOpacity style={styles.viewButton} onPress={onViewAll}>
        <Text style={styles.viewButtonText}>View all</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.memoriesCard}>
      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memoryItem}>
            <Text style={styles.memoryText}>{item.text}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
      />
    </View>
    <TouchableOpacity style={styles.addButton} onPress={() => {}}>
      <Text style={styles.addButtonText}>+ Add new memory</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 12,
  },
  viewButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    color: "#e03487",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  memoriesCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  memoryItem: {
    paddingVertical: 12,
  },
  memoryText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
  },
  separator: {
    height: 1,
    backgroundColor: "#393a4a",
    opacity: 0.5,
    marginVertical: 8,
  },
  addButton: {
    marginTop: 18,
    alignSelf: "center",
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default FavoriteMemories;

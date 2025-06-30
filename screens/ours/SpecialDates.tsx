import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

type SpecialDate = {
  id: string;
  label: string;
  date: string;
};

type Props = {
  dates: SpecialDate[];
  onViewAll?: () => void;
};

const SpecialDates: React.FC<Props> = ({ dates, onViewAll }) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Our special dates</Text>
      <TouchableOpacity style={styles.viewButton} onPress={onViewAll}>
        <Text style={styles.viewButtonText}>View all</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.datesCard}>
      <FlatList
        data={dates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>{item.label}</Text>
            <Text style={styles.dateValue}>{item.date}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
      />
    </View>
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => {
        /* handle add new date */
      }}
    >
      <Text style={styles.addButtonText}>+ Add new date</Text>
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
  datesCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dateLabel: {
    color: "#b0b3c6",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  dateValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: "#393a4a",
    opacity: 0.5,
    marginVertical: 2,
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

export default SpecialDates;

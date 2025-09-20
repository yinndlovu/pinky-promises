// external
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

// internal
import { SpecialDateProps } from "../../../types/SpecialDate";
import { STANDARD_FIELDS } from "../../../constants/specialDate";
import { formatDateDMY } from "../../../utils/formatters/formatDate";

// helpers
function formatExtraLabel(key: string): string {
  const withSpaces = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1) + ":";
}

const SpecialDates: React.FC<SpecialDateProps> = ({
  dates,
  onAdd,
  onLongPressDate,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.sectionTitle}>Our special dates</Text>
    <View style={styles.datesCard}>
      {dates.length === 0 ? (
        <Text style={styles.emptyText}>
          No special dates yet. Add your first one!
        </Text>
      ) : (
        <FlatList
          data={dates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.6}
              onLongPress={() => onLongPressDate && onLongPressDate(item)}
              delayLongPress={400}
            >
              <View style={styles.dateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>{item.title}</Text>
                  <Text style={styles.dateValue}>
                    {formatDateDMY(item.date)}
                  </Text>
                  {item.description ? (
                    <Text style={styles.dateDescription}>
                      {item.description}
                    </Text>
                  ) : null}
                  {Object.entries(item)
                    .filter(
                      ([key, value]) =>
                        !STANDARD_FIELDS.includes(key) &&
                        (typeof value === "string" ||
                          typeof value === "number") &&
                        String(value).trim() !== ""
                    )
                    .map(([key, value]) => (
                      <Text style={styles.dateExtra} key={key}>
                        {formatExtraLabel(key)} {String(value)}
                      </Text>
                    ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
        />
      )}
    </View>
    <TouchableOpacity style={styles.addButton} onPress={onAdd}>
      <Text style={styles.addButtonText}>+ Add new date</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    letterSpacing: 0,
    marginLeft: 12,
    marginBottom: 14,
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
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dateValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 4,
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
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  dateDescription: {
    color: "#aeb1c2",
    fontSize: 14,
    marginTop: 2,
    marginBottom: 3,
  },
  dateExtra: {
    color: "#858794",
    fontSize: 12,
    marginTop: 1,
  },
  emptyText: {
    color: "#b0b3c6",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 24,
  },
});

export default SpecialDates;

// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

// internal
import { PastGiftProps } from "../../../types/Gift";
import { useTheme } from "../../../theme/ThemeContext";

const PastGiftsList: React.FC<PastGiftProps> = ({ gifts }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past Received Presents</Text>
      <FlatList
        data={gifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <FontAwesome5
              name="gift"
              size={20}
              color={theme.colors.primary}
              style={styles.icon}
            />
            <View style={styles.details}>
              <Text style={styles.giftName}>{item.giftName}</Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Received: </Text>
                {item.receivedAt}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Claimed: </Text>
                {item.claimedAt}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.colors.muted,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            You haven't opened any presents yet
          </Text>
        }
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginTop: 8,
      marginBottom: 8,
    },
    title: {
      fontSize: 15,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 10,
      marginLeft: 2,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 2,
    },
    icon: {
      marginRight: 12,
      marginTop: 2,
    },
    details: {
      flex: 1,
    },
    giftName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 2,
    },
    detailText: {
      color: theme.colors.muted,
      fontSize: 13,
      marginBottom: 1,
    },
    label: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    separator: {
      height: 6,
    },
  });

export default PastGiftsList;

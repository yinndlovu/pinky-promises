// external
import React, { useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import {
  RecentActivityItem,
  RecentActivityProps,
} from "../../../types/RecentActivity";
import { useTheme } from "../../../theme/ThemeContext";

type AnimatedActivityItemProps = {
  item: RecentActivityItem;
  children: React.ReactNode;
};

const AnimatedActivityItem: React.FC<AnimatedActivityItemProps> = ({
  item,
  children,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
      {activities.length === 0 ? (
        <View style={styles.noActivityContainer}>
          <Text style={styles.noActivityText}>No recent activities</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedActivityItem item={item}>
              <View style={styles.activityRow}>
                <View style={styles.iconWrapper}>
                  <Feather
                    name="activity"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.datetime}>
                    {item.date} • {item.time}
                  </Text>
                </View>
              </View>
            </AnimatedActivityItem>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginTop: 10,
      marginBottom: 50,
    },
    sectionTitle: {
      fontSize: 14,
      color: theme.colors.muted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginLeft: 16,
      marginBottom: 10,
      alignSelf: "flex-start",
    },
    noActivityContainer: {
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    noActivityText: {
      color: theme.colors.muted,
      fontSize: 16,
      fontWeight: "400",
      textAlign: "center",
    },
    activityRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 16,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      marginBottom: 6,
      width: "100%",
    },
    iconWrapper: {
      marginRight: 12,
      marginTop: 2,
    },
    textWrapper: {
      flex: 1,
    },
    description: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 2,
    },
    datetime: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "400",
    },
    separator: {
      height: 6,
    },
  });

export default RecentActivity;

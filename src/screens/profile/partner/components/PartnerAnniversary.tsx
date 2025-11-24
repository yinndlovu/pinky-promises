// external
import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";

// internal
import { useSpecialDates } from "../../../../hooks/useSpecialDate";
import { useAuth } from "../../../../contexts/AuthContext";
import useToken from "../../../../hooks/useToken";
import { SpecialDate } from "../../../../types/SpecialDate";
import { useTheme } from "../../../../theme/ThemeContext";

// screen content
import Shimmer from "../../../../components/skeletons/Shimmer";

const PartnerAnniversary = () => {
  // variables
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // fetch functions
  const { data: specialDates = [], isLoading: specialDatesLoading } =
    useSpecialDates(user?.id, token);

  // helpers
  const formatDisplayDate = (
    dateString: string,
    timeInfo?: string
  ): { date: string; timeInfo?: string } => {
    if (!dateString || dateString === "Not set") {
      return { date: "Not set" };
    }

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;

      return {
        date: formattedDate,
        timeInfo,
      };
    } catch (error) {
      return { date: dateString };
    }
  };

  const getAnniversaryDisplay = () => {
    const anniversary = specialDates.find((date: SpecialDate) =>
      date.title.toLowerCase().includes("anniversary")
    );

    if (anniversary) {
      return formatDisplayDate(anniversary.date, anniversary.togetherFor);
    }
    return {
      date: "Not set",
    };
  };

  const getDayMetDisplay = () => {
    const dayMet = specialDates.find((date: SpecialDate) =>
      date.title.toLowerCase().includes("met")
    );

    if (dayMet) {
      return formatDisplayDate(dayMet.date, dayMet.knownFor);
    }
    return {
      date: "Not set",
    };
  };

  // declarations
  const anniversaryDisplay = getAnniversaryDisplay();
  const dayMetDisplay = getDayMetDisplay();

  if (specialDatesLoading) {
    return (
      <View style={styles.wrapper}>
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Anniversary date</Text>
      </View>
      <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{anniversaryDisplay.date}</Text>
          {anniversaryDisplay.timeInfo && (
            <Text style={styles.timeInfo}>
              {" "}
              ({anniversaryDisplay.timeInfo})
            </Text>
          )}
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Day met</Text>
      </View>
      <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{dayMetDisplay.date}</Text>
          {dayMetDisplay.timeInfo && (
            <Text style={styles.timeInfo}> ({dayMetDisplay.timeInfo})</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 24,
    },
    row: {
      marginTop: 10,
      marginBottom: 4,
    },
    label: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 2,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    valueContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    value: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "bold",
    },
    timeInfo: {
      fontSize: 16,
      color: theme.colors.mutedAlt,
      fontWeight: "normal",
    },
  });

export default PartnerAnniversary;

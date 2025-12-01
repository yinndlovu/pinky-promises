import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface Props {
  isOnPeriod: boolean;
  isPartnerView: boolean;
  onAddCustomAid: () => void;
  onViewAllAids: () => void;
  onLogIssue: () => void;
  onAddLookout: () => void;
}

const QuickActionsRow: React.FC<Props> = ({
  isOnPeriod,
  isPartnerView,
  onAddCustomAid,
  onViewAllAids,
  onLogIssue,
  onAddLookout,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const actions: QuickAction[] = isPartnerView
    ? [
        {
          id: "log",
          icon: "edit-3",
          label: "Log Issue",
          color: "#ff6b9d",
          onPress: onLogIssue,
        },
        {
          id: "lookout",
          icon: "eye",
          label: "Add Lookout",
          color: "#a29bfe",
          onPress: onAddLookout,
        },
        {
          id: "tips",
          icon: "book-open",
          label: "View Tips",
          color: "#00b894",
          onPress: onViewAllAids,
        },
      ]
    : [
        {
          id: "custom",
          icon: "plus-circle",
          label: "My Needs",
          color: "#ff6b9d",
          onPress: onAddCustomAid,
        },
        {
          id: "tips",
          icon: "book-open",
          label: "All Tips",
          color: "#a29bfe",
          onPress: onViewAllAids,
        },
        {
          id: "history",
          icon: "clock",
          label: "History",
          color: "#00b894",
          onPress: () => {},
        },
      ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.action}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: action.color + "20" },
            ]}
          >
            <Feather name={action.icon as any} size={22} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 8,
    },
    action: {
      flex: 1,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
    },
  });

export default QuickActionsRow;


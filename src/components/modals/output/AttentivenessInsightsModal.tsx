// external
import React, { useEffect, useRef, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import {
  AttentivenessInsights,
  AttentivenessMessage,
} from "../../../services/api/attentiveness/attentivenessService";

// types
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface AttentivenessInsightsModalProps {
  visible: boolean;
  insights: AttentivenessInsights | null;
  onClose: () => void;
  onMarkAsShown: (weekKey: string) => void;
}

const AttentivenessInsightsModal: React.FC<AttentivenessInsightsModalProps> = ({
  visible,
  insights,
  onClose,
  onMarkAsShown,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 50,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (insights?.weekKey) {
      onMarkAsShown(insights.weekKey);
    }
    onClose();
  };

  const getIconForType = (
    type: AttentivenessMessage["type"]
  ): { name: IconName; color: string } => {
    switch (type) {
      case "attentiveness":
        return {
          name: "heart-multiple",
          color: "#FF6B9D",
        };
      case "interaction_highlight":
        return {
          name: "star",
          color: "#FFD93D",
        };
      case "leaderboard":
        return {
          name: "trophy",
          color: "#4CAF50",
        };
      default:
        return {
          name: "information",
          color: theme.colors.primary,
        };
    }
  };

  const renderMessage = (message: AttentivenessMessage, index: number) => {
    const { name, color } = getIconForType(message.type);

    return (
      <View key={index} style={styles.messageCard}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <MaterialCommunityIcons name={name} size={28} color={color} />
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageTitle}>{message.message}</Text>
          {message.subMessage && (
            <Text style={styles.messageSubtitle}>{message.subMessage}</Text>
          )}
          {message.type === "leaderboard" && message.data && (
            <View style={styles.leaderboardContainer}>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardName}>
                  {message.data.user?.name}
                </Text>
                <Text style={styles.leaderboardScore}>
                  {message.data.user?.score} pts
                </Text>
              </View>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardName}>
                  {message.data.partner?.name}
                </Text>
                <Text style={styles.leaderboardScore}>
                  {message.data.partner?.score} pts
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!insights || !insights.messages || insights.messages.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Your Attentiveness Insights</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {insights.messages.map((message, index) =>
              renderMessage(message, index)
            )}
          </ScrollView>

          <TouchableOpacity style={styles.okButton} onPress={handleClose}>
            <Text style={styles.okButtonText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
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
      borderRadius: 20,
      padding: 24,
      width: "85%",
      maxHeight: "80%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    messagesContainer: {
      maxHeight: 400,
      marginBottom: 20,
    },
    messageCard: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: "flex-start",
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    messageContent: {
      flex: 1,
    },
    messageTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    messageSubtitle: {
      color: theme.colors.muted,
      fontSize: 14,
      marginTop: 4,
    },
    leaderboardContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    leaderboardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    leaderboardName: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "500",
    },
    leaderboardScore: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "bold",
    },
    okButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      width: "100%",
      alignItems: "center",
    },
    okButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default AttentivenessInsightsModal;


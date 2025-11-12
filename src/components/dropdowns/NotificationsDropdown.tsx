// external
import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

// internal
import { Notification } from "../../interfaces/Notification";
import { formatDateDMY, formatTime } from "../../utils/formatters/formatDate";
import { useTheme } from "../../theme/ThemeContext";

interface Props {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
}

const NotificationsDropdown: React.FC<Props> = ({
  visible,
  notifications,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!visible) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.dropdown}>
            {notifications.length === 0 ? (
              <Text style={styles.noNotificationsText}>No notifications</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={[
                      styles.notificationItem,
                      !n.seen && styles.notificationItemUnread,
                    ]}
                  >
                    {!n.seen ? (
                      <View style={styles.unseenDot} />
                    ) : (
                      <View style={{ width: 10 }} />
                    )}
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{n.title}</Text>
                      <Text style={styles.notificationMessage}>{n.body}</Text>
                      <Text style={styles.notificationDate}>
                        {formatDateDMY(n.createdAt)} • {formatTime(n.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
      zIndex: 25,
    },
    dropdown: {
      position: "absolute",
      top: 100,
      right: 12,
      width: 320,
      maxHeight: 360,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 8,
      zIndex: 30,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
    },
    notificationItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 10,
      borderRadius: 10,
      marginBottom: 6,
    },
    notificationItemUnread: {
      backgroundColor: theme.colors.unreadNotificationBackground,
    },
    notificationContent: {
      flex: 1,
      marginLeft: 8,
    },
    notificationTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    notificationMessage: {
      color: theme.colors.muted,
      fontSize: 13,
      marginTop: 4,
    },
    notificationDate: {
      color: theme.colors.mutedAlt,
      fontSize: 11,
      marginTop: 6,
    },
    unseenDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
      marginTop: 6,
    },
    noNotificationsText: {
      color: theme.colors.muted,
      textAlign: "center",
      padding: 20,
    },
  });

export default NotificationsDropdown;

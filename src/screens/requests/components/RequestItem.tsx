// external
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";

// internal
import ProfileImage from "../../../components/common/ProfileImage";
import { createPendingRequestsStyles } from "../styles/PendingRequestsScreen.styles";
import { PendingRequest } from "../../../types/Request";

// internal (hooks)
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { useProfilePicture } from "../../../hooks/useProfilePicture";

// interfaces
interface RequestItemProps {
  item: PendingRequest;
  processingAccept: string | null;
  processingReject: string | null;
  onAccept: (id: string, senderId: string) => void;
  onReject: (id: string) => void;
}

const RequestItem = ({
  item,
  processingAccept,
  processingReject,
  onAccept,
  onReject,
}: RequestItemProps) => {
  // hook variables
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createPendingRequestsStyles(theme), [theme]);

  // guard the item
  if (!item.sender) {
    return null;
  }

  // fetch the profile picture
  const { avatarUri, profilePicUpdatedAt, fetchPicture } = useProfilePicture(
    item.sender.id,
    token
  );

  // use states
  const [avatarFetched, setAvatarFetched] = useState(false);

  // use effects
  useEffect(() => {
    if (token) {
      Promise.resolve(fetchPicture()).finally(() => setAvatarFetched(true));
    }
  }, [token]);

  const isAccepting = processingAccept === item.id;
  const isRejecting = processingReject === item.id;
  const isProcessing = isAccepting || isRejecting;

  return (
    <View style={styles.requestItem}>
      <View style={styles.userInfo}>
        <ProfileImage
          userId={item.sender.id}
          avatarUri={avatarUri}
          updatedAt={profilePicUpdatedAt}
          avatarFetched={avatarFetched}
          style={styles.avatar}
        />

        <View style={styles.userDetails}>
          <Text style={styles.username}>@{item.sender.username}</Text>
          <Text style={styles.requestText}>wants to be your partner</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onAccept(item.id, item.sender!.id)}
          disabled={isProcessing}
        >
          {isAccepting ? (
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <Text style={styles.actionButtonText}>Accept</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => onReject(item.id)}
          disabled={isProcessing}
        >
          {isRejecting ? (
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <Text style={styles.actionButtonText}>Decline</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RequestItem;

// external
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLayoutEffect } from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { removePartner } from "../../../../services/api/profiles/partnerService";
import { buildCachedImageUrl } from "../../../../utils/cache/imageCacheUtils";
import { favoritesObjectToArray } from "../../../../helpers/profileHelpers";
import { formatDistance } from "../../../../utils/formatters/formatDistance";
import { useAuth } from "../../../../contexts/AuthContext";

// screen content
import ConfirmationModal from "../../../../components/modals/selection/ConfirmationModal";
import PartnerMoreAboutYou from "../components/PartnerMoreAboutYou";
import ProfilePictureViewer from "../../../../components/modals/output/ProfilePictureViewer";
import PartnerFavorites from "../components/PartnerFavorites";
import PartnerLoveLanguage from "../components/PartnerLoveLanguage";
import PartnerStatusMood from "../components/PartnerStatusMood";
import PartnerAnniversary from "../components/PartnerAnniversary";
import styles from "../styles/PartnerProfileScreen.styles";
import PartnerMessageStorage from "../components/PartnerMessageStorage";
import ViewMessageModal from "../../../../components/modals/output/ViewMessageModal";
import LoadingSpinner from "../../../../components/loading/LoadingSpinner";

// hooks
import useToken from "../../../../hooks/useToken";
import { useProfilePicture } from "../../../../hooks/useProfilePicture";
import { usePartner } from "../../../../hooks/usePartner";
import { useProfile } from "../../../../hooks/useProfile";
import { useFavorites } from "../../../../hooks/useFavorites";
import { useLoveLanguage } from "../../../../hooks/useLoveLanguage";
import { useAbout } from "../../../../hooks/useAbout";
import { usePartnerDistance, useUserStatus } from "../../../../hooks/useStatus";
import { useReceivedMessages } from "../../../../hooks/useStoredMessages";
import { useUserMood } from "../../../../hooks/useMood";

const PartnerProfileScreen = ({ navigation }: any) => {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();

  // use states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // use states (processing)
  const [removingPartner, setRemovingPartner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  // use states (message storage)
  const [viewMessageModalVisible, setViewMessageModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // data
  const {
    data: partner,
    refetch: refetchPartnerData,
    isLoading: partnerLoading,
  } = usePartner(user?.id, token);
  const {
    data: currentUser,
    refetch: refetchCurrentUser,
    isLoading: currentUserLoading,
  } = useProfile(user?.id, token);
  const { data: partnerStatus, refetch: refetchPartnerStatus } = useUserStatus(
    partner?.id,
    token
  );
  const { data: partnerMood, refetch: refetchPartnerMood } = useUserMood(
    partner?.id,
    token
  );
  const { data: partnerFavorites = {} } = useFavorites(partner?.id, token);
  const { data: loveLanguage } = useLoveLanguage(partner?.id, token);
  const { data: partnerAbout } = useAbout(partner?.id, token);
  const { data: partnerDistance } = usePartnerDistance(user?.id, token);
  const { data: partnerStoredMessages = [] } = useReceivedMessages(
    user?.id,
    token
  );
  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(partner?.id, token);

  // use layouts
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("PortalScreen")}
          style={{ marginRight: 20 }}
        >
          <Feather name="aperture" size={26} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // use effects
  useEffect(() => {
    if (token && partner?.id) {
      fetchPartnerPicture();
    }
  }, [partner?.id, token]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // refresh screen
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchPartnerData();
      await refetchCurrentUser();

      if (partner?.id) {
        await Promise.all([
          refetchPartnerMood(),
          refetchPartnerStatus(),
          fetchPartnerPicture(),
        ]);
      }
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchPartnerData,
    refetchCurrentUser,
    refetchPartnerMood,
    refetchPartnerStatus,
    fetchPartnerPicture,
    partner?.id,
  ]);

  // format data
  const mood = partnerMood?.mood || "No mood";
  const moodDescription =
    partnerMood?.description || `${partner?.name} hasn't set a mood yet`;

  const status = partnerStatus?.unreachable
    ? "unreachable"
    : partnerStatus?.isAtHome
    ? "home"
    : partnerStatus?.isAtHome === false
    ? "away"
    : "unavailable";

  const statusDescription = partnerStatus?.unreachable
    ? `Can't find ${partner?.name}'s current location`
    : partnerStatus?.isAtHome
    ? `${partner?.name} is currently at home`
    : partnerStatus?.isAtHome === false
    ? `${partner?.name} is currently not home`
    : `${partner?.name} hasn't set a home location`;

  // handlers
  const handleRemovePartner = async () => {
    setRemovingPartner(true);
    try {
      await removePartner(token);
      await queryClient.invalidateQueries({
        queryKey: ["partnerData", user?.id],
      });

      setShowRemoveModal(false);

      if (partner?.id) {
        navigation.replace("UserProfile", { userId: partner.id });
      }
    } catch (error: any) {
    } finally {
      setRemovingPartner(false);
    }
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setViewMessageModalVisible(true);
  };

  const renderProfileImage = () => {
    if (avatarUri && profilePicUpdatedAt && partner.id) {
      const timestamp = Math.floor(
        new Date(profilePicUpdatedAt).getTime() / 1000
      );
      const cachedImageUrl = buildCachedImageUrl(
        partner.id.toString(),
        timestamp
      );

      return (
        <Image
          source={
            failed
              ? require("../../../../assets/default-avatar-two.png")
              : { uri: cachedImageUrl }
          }
          style={styles.avatar}
          cachePolicy="disk"
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      );
    }

    return (
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require("../../../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        cachePolicy="disk"
        contentFit="cover"
        transition={200}
      />
    );
  };

  if (partnerLoading || currentUserLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

  if (!partner) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
          You have no partner
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      {!isOnline && (
        <View
          style={{
            backgroundColor: "red",
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e03487"
            colors={["#e03487"]}
            progressBackgroundColor="#23243a"
          />
        }
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity onPress={() => setShowPictureViewer(true)}>
              {renderProfileImage()}
            </TouchableOpacity>
          </View>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{partner?.name || "User"}</Text>
            {partner?.username ? (
              <Text style={styles.username}>
                @{partner?.username || "user"}
              </Text>
            ) : null}
            {partner?.bio ? (
              <Text style={styles.bio}>{partner?.bio}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setShowRemoveModal(true)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.partnerRow}>
          <Text style={styles.partnerText}>
            Partner:{" "}
            <Text style={styles.partnerName}>{currentUser?.name || "You"}</Text>
          </Text>
          <Text style={styles.distanceText}>
            {partnerDistance?.distance !== undefined
              ? `${formatDistance(partnerDistance.distance)} `
              : ""}
            <Text style={styles.apartText}>
              {partnerDistance?.distance !== undefined ? "apart" : ""}
            </Text>
          </Text>
        </View>

        {partner?.id && (
          <PartnerStatusMood
            status={status}
            statusDescription={statusDescription}
            mood={mood || "No mood"}
            moodDescription={moodDescription}
            statusDistance={partnerStatus?.distance}
          />
        )}

        <PartnerAnniversary />

        <PartnerFavorites
          favorites={favoritesObjectToArray(partnerFavorites)}
        />

        {partnerLoading && (
          <View style={styles.centered}>
            <ActivityIndicator color="#5ad1e6" size="large" />
          </View>
        )}

        <View style={styles.divider} />

        <PartnerLoveLanguage loveLanguage={loveLanguage} />

        <PartnerMoreAboutYou about={partnerAbout} />

        <PartnerMessageStorage
          name={partner?.name}
          messages={partnerStoredMessages}
          onPress={handleViewMessage}
        />
      </ScrollView>

      <View style={{ zIndex: 1000 }}>
        <ConfirmationModal
          visible={showRemoveModal}
          message="Are you sure you want to remove your partner?"
          onConfirm={handleRemovePartner}
          onCancel={() => setShowRemoveModal(false)}
          confirmText="Remove"
          cancelText="Cancel"
          onClose={() => setShowRemoveModal(false)}
          loading={removingPartner}
        />

        <ProfilePictureViewer
          visible={showPictureViewer}
          imageUri={
            partner && profilePicUpdatedAt
              ? buildCachedImageUrl(
                  partner?.id.toString(),
                  Math.floor(new Date(profilePicUpdatedAt).getTime() / 1000)
                )
              : null
          }
          onClose={() => setShowPictureViewer(false)}
        />

        <ViewMessageModal
          visible={viewMessageModalVisible}
          onClose={() => setViewMessageModalVisible(false)}
          message={selectedMessage}
          type="stored"
        />
      </View>
    </View>
  );
};

export default PartnerProfileScreen;

// external
import React, { useEffect, useState, useCallback } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { getUserFavorites } from "../../../../services/api/profiles/favoritesService";
import { getLoveLanguage } from "../../../../services/api/profiles/loveLanguageService";
import { getAboutUser } from "../../../../services/api/profiles/aboutUserService";
import {
  removePartner,
  getPartner,
} from "../../../../services/api/profiles/partnerService";
import { buildCachedImageUrl } from "../../../../utils/cache/imageCacheUtils";
import { favoritesObjectToArray } from "../../../../helpers/profileHelpers";
import { getReceivedMessages } from "../../../../services/api/profiles/messageStorageService";
import { getPartnerDistance } from "../../../../services/api/profiles/distanceService";
import { formatDistance } from "../../../../utils/formatters/formatDistance";
import { useAuth } from "../../../../contexts/AuthContext";
import { useProfilePicture } from "../../../../hooks/useProfilePicture";
import { getProfile } from "../../../../services/api/profiles/profileService";

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
import useToken from "../../../../hooks/useToken";

const PartnerProfileScreen = ({ navigation }: any) => {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();

  // use states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // use states (processing)
  const [removingPartner, setRemovingPartner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // use states (message storage)
  const [viewMessageModalVisible, setViewMessageModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  if (!token) {
    return;
  }

  // fetch functions
  const {
    data: partnerData,
    isLoading: partnerDataLoading,
    refetch: refetchPartnerData,
  } = useQuery({
    queryKey: ["partnerData", user?.id],
    queryFn: async () => {
      return await getPartner(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const partner = partnerData || null;

  const {
    data: currentUser,
    isLoading: currentUserLoading,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ["profileData", user?.id],
    queryFn: async () => {
      return await getProfile(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const {
    data: partnerFavorites = {},
    isLoading: partnerFavoritesLoading,
    refetch: refetchPartnerFavorites,
  } = useQuery({
    queryKey: ["partnerFavorites", user?.id],
    queryFn: async () => {
      const partnerId = partner?.id;

      if (!partnerId) {
        return {};
      }

      return await getUserFavorites(token, partnerId);
    },
    enabled: !!partner?.id,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: loveLanguage,
    isLoading: loveLanguageLoading,
    refetch: refetchLoveLanguage,
  } = useQuery({
    queryKey: ["partnerLoveLanguage", user?.id],
    queryFn: async () => {
      return await getLoveLanguage(token, partner?.id);
    },
    enabled: !!partner?.id,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: partnerAbout,
    isLoading: partnerAboutLoading,
    refetch: refetchPartnerAbout,
  } = useQuery({
    queryKey: ["partnerAbout", user?.id],
    queryFn: async () => {
      return await getAboutUser(token, partner?.id);
    },
    enabled: !!partner?.id,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: partnerStoredMessages = [],
    isLoading: partnerStoredMessagesLoading,
    refetch: refetchPartnerStoredMessages,
  } = useQuery({
    queryKey: ["partnerStoredMessages", user?.id],
    queryFn: async () => {
      const response = await getReceivedMessages(token);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: partnerDistance,
    isLoading: partnerDistanceLoading,
    refetch: refetchPartnerDistance,
  } = useQuery({
    queryKey: ["partnerDistance", user?.id],
    queryFn: async () => {
      return await getPartnerDistance(token);
    },
    enabled: !!partner?.id,
    staleTime: 1000 * 60 * 60 * 24,
  });

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
          source={cachedImageUrl}
          style={styles.avatar}
          cachePolicy="disk"
          contentFit="cover"
          transition={200}
        />
      );
    }

    return (
      <Image
        source={
          avatarUri
            ? avatarUri
            : require("../../../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

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

  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(partner?.id, token);

  // use effects
  useEffect(() => {
    if (partner?.id) {
      fetchPartnerPicture();
    }
  }, [partner?.id]);

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
          refetchPartnerFavorites(),
          refetchLoveLanguage(),
          refetchPartnerAbout(),
          fetchPartnerPicture(),
          refetchPartnerStoredMessages(),
        ]);
      }

      setRefreshKey((k) => k + 1);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchLoveLanguage,
    refetchPartnerData,
    refetchPartnerFavorites,
    refetchCurrentUser,
    refetchPartnerAbout,
    fetchPartnerPicture,
    refetchPartnerStoredMessages,
    partner?.id,
  ]);

  // declarations
  const name = partner?.name || "User";
  const username = partner?.username || "user";
  const bio = partner?.bio || "";

  if (partnerDataLoading || currentUserLoading) {
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
            <Text style={styles.name}>{name}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
            {bio ? <Text style={styles.bio}>{bio}</Text> : null}
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

        <PartnerStatusMood
          partnerId={partner.id}
          partnerName={name}
          refreshKey={refreshKey}
        />

        <PartnerAnniversary />

        <PartnerFavorites
          favorites={favoritesObjectToArray(partnerFavorites)}
        />

        {partnerDataLoading && (
          <View style={styles.centered}>
            <ActivityIndicator color="#5ad1e6" size="large" />
          </View>
        )}

        <View style={styles.divider} />

        <PartnerLoveLanguage loveLanguage={loveLanguage} />

        <PartnerMoreAboutYou about={partnerAbout} />

        <PartnerMessageStorage
          name={name}
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

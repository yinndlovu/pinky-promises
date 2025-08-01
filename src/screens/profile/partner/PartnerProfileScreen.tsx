// external
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { encode } from "base64-arraybuffer";
import { Feather } from "@expo/vector-icons";
import { useLayoutEffect } from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { getUserFavorites } from "../../../services/favoritesService";
import { getLoveLanguage } from "../../../services/loveLanguageService";
import { getAboutUser } from "../../../services/aboutUserService";
import { removePartner } from "../../../services/partnerService";
import { BASE_URL } from "../../../configuration/config";
import { buildCachedImageUrl } from "../../../utils/imageCacheUtils";
import { favoritesObjectToArray } from "../../../helpers/profileHelpers";
import { getReceivedMessages } from "../../../services/messageStorageService";

// screen content
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import PartnerMoreAboutYou from "./PartnerMoreAboutYou";
import ProfilePictureViewer from "../../../components/modals/output/ProfilePictureViewer";
import PartnerFavorites from "./PartnerFavorites";
import PartnerLoveLanguage from "./PartnerLoveLanguage";
import PartnerStatusMood from "./PartnerStatusMood";
import PartnerAnniversary from "./PartnerAnniversary";
import styles from "./styles/PartnerProfileScreen.styles";
import PartnerMessageStorage from "./PartnerMessageStorage";
import ViewMessageModal from "../../../components/modals/output/ViewMessageModal";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const PartnerProfileScreen = ({ navigation }: any) => {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // use states
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );
  const [isOnline, setIsOnline] = useState(true);

  // use states (processing)
  const [removingPartner, setRemovingPartner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // use states (message storage)
  const [viewMessageModalVisible, setViewMessageModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // fetch functions
  const {
    data: partnerData,
    isLoading: partnerDataLoading,
    refetch: refetchPartnerData,
  } = useQuery({
    queryKey: ["partnerData"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return null;
      }

      const response = await axios.get(
        `${BASE_URL}/api/partnership/get-partner`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.partner;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const partner = partnerData || null;

  const fetchProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token || !partner?.id) {
        setAvatarUri(null);
        return;
      }

      const pictureResponse = await axios.get(
        `${BASE_URL}/api/profile/get-profile-picture/${partner?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );

      const mime = pictureResponse.headers["content-type"] || "image/jpeg";
      const base64 = `data:${mime};base64,${encode(pictureResponse.data)}`;

      setAvatarUri(base64);

      const lastModified = pictureResponse.headers["last-modified"];
      setProfilePicUpdatedAt(
        lastModified ? new Date(lastModified) : new Date()
      );
    } catch (picErr: any) {
      setAvatarUri(null);
    }
  };

  const {
    data: currentUser,
    isLoading: currentUserLoading,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ["profileData"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return null;
      }

      const response = await axios.get(`${BASE_URL}/api/profile/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.user;
    },
    staleTime: 1000 * 60 * 60 * 24 * 3,
  });

  const currentUserName = currentUser?.name || "You";

  const {
    data: partnerFavorites = {},
    isLoading: partnerFavoritesLoading,
    refetch: refetchPartnerFavorites,
  } = useQuery({
    queryKey: ["partnerFavorites", partner?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      const partnerId = partner?.id;

      if (!token || !partnerId) {
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
    queryKey: ["partnerLoveLanguage", partner?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

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
    queryKey: ["partnerAbout", partner?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

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
    queryKey: ["partnerStoredMessages"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await getReceivedMessages(token);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 1000 * 60 * 60,
  });

  // handlers
  const handleRemovePartner = async () => {
    setRemovingPartner(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      await removePartner(token);
      await queryClient.invalidateQueries({
        queryKey: ["partnerData"],
      });

      setShowRemoveModal(false);

      navigation.replace("UserProfile", { userId: partner.id });
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
    if (avatarUri && profilePicUpdatedAt && partner) {
      const cachedImageUrl = buildCachedImageUrl(
        partner.id,
        profilePicUpdatedAt
      );
      return (
        <Image
          source={cachedImageUrl}
          style={styles.avatar}
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
            : require("../../../assets/default-avatar-two.png")
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

  // use effects
  useEffect(() => {
    if (partner?.id) {
      fetchProfilePicture();
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
          fetchProfilePicture(),
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
    fetchProfilePicture,
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
            <Text style={styles.partnerName}>{currentUserName || "You"}</Text>
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
              ? buildCachedImageUrl(partner.id, profilePicUpdatedAt)
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

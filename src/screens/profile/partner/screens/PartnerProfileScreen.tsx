// external
import { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLayoutEffect } from "react";
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
import { createPartnerProfileStyles } from "../styles/PartnerProfileScreen.styles";
import { useTheme } from "../../../../theme/ThemeContext";

// screen content
import ConfirmationModal from "../../../../components/modals/selection/ConfirmationModal";
import PartnerMoreAboutYou from "../components/PartnerMoreAboutYou";
import ProfilePictureViewer from "../../../../components/modals/output/ProfilePictureViewer";
import PartnerFavorites from "../components/PartnerFavorites";
import PartnerLoveLanguage from "../components/PartnerLoveLanguage";
import PartnerStatusMood from "../components/PartnerStatusMood";
import PartnerAnniversary from "../components/PartnerAnniversary";
import PartnerMessageStorage from "../components/PartnerMessageStorage";
import ViewMessageModal from "../../../../components/modals/output/ViewMessageModal";
import AvatarSkeleton from "../../../../components/skeletons/AvatarSkeleton";
import Shimmer from "../../../../components/skeletons/Shimmer";
import ErrorState from "../../../../components/common/ErrorState";

// hooks
import useToken from "../../../../hooks/useToken";
import { useProfilePicture } from "../../../../hooks/useProfilePicture";
import { useHome } from "../../../../hooks/useHome";
import { useHomeSelector } from "../../../../hooks/useHomeSelector";
import { useProfile } from "../../../../hooks/useProfile";
import { useProfileSelector } from "../../../../hooks/useProfileSelector";

const PartnerProfileScreen = ({ navigation, route }: any) => {
  // variables
  const { userId } = route.params as { userId: string };
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createPartnerProfileStyles(theme), [theme]);

  // use states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [avatarFetched, setAvatarFetched] = useState(false);

  // use states (processing)
  const [removingPartner, setRemovingPartner] = useState(false);
  const [failed, setFailed] = useState(false);

  // use states (message storage)
  const [viewMessageModalVisible, setViewMessageModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  // data fetch
  const {
    data: _profileData,
    isLoading: profileLoading,
    refetch: refetchProfileData,
    isError: profileError,
  } = useProfile(token, userId);
  const { data: _homeData, isLoading: homeLoading } = useHome(token, user?.id);
  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(userId, token);

  // select the data from home selector
  const partnerStatus =
    useHomeSelector(user?.id, (state) => state?.partnerStatus) || null;
  const partnerMood =
    useHomeSelector(user?.id, (state) => state?.partnerMood) || null;

  // select data from profile selector
  const partner =
    useProfileSelector(userId, (state) => state?.userData) || null;
  const partnerFavorites =
    useProfileSelector(userId, (state) => state?.userFavorites) || {};
  const loveLanguage =
    useProfileSelector(userId, (state) => state?.loveLanguage) || null;
  const partnerAbout =
    useProfileSelector(userId, (state) => state?.aboutUser) || null;
  const partnerDistance =
    useProfileSelector(userId, (state) => state?.partnerDistance) || null;
  const partnerStoredMessages =
    useProfileSelector(userId, (state) => state?.storedMessages) || [];
  const specialDates =
    useProfileSelector(userId, (state) => state?.specialDates) || [];

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
    if (token && userId) {
      Promise.resolve(fetchPartnerPicture()).finally(() =>
        setAvatarFetched(true)
      );
    }
  }, [userId, token]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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

    if (!avatarFetched) {
      return (
        <AvatarSkeleton
          style={styles.avatar}
          darkColor={theme.colors.skeletonDark}
          highlightColor={theme.colors.skeletonHighlight}
        />
      );
    }

    if (!avatarUri) {
      return (
        <Image
          source={require("../../../../assets/default-avatar-two.png")}
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
            ? { uri: avatarUri }
            : require("../../../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        cachePolicy="disk"
        contentFit="cover"
        transition={200}
        onError={() => setFailed(true)}
      />
    );
  };

  if (profileError) {
    return (
      <ErrorState
        message="Failed to load partner profile. Try again?"
        onRetry={() => refetchProfileData()}
      />
    );
  }

  if (!partner) {
    return (
      <View style={styles.centered}>
        <Text
          style={{ color: theme.colors.text, fontSize: 22, fontWeight: "bold" }}
        >
          You have no partner
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
          <Text style={{ color: theme.colors.text, textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {profileLoading ? (
          <View style={styles.profileRow}>
            <Shimmer radius={8} height={40} style={{ width: "100%" }} />
          </View>
        ) : (
          <>
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
            </View>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setShowRemoveModal(true)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() =>
                  navigation.navigate("PartnerChatScreen", {
                    partnerId: partner?.id,
                    partnerName: partner?.name,
                  })
                }
              >
                <Feather
                  name="message-circle"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            <View style={styles.partnerRow}>
              <Text style={styles.partnerText}>
                Partner:{" "}
                <Text style={styles.partnerName}>
                  {partner?.partnerName || "You"}
                </Text>
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
          </>
        )}

        {homeLoading || homeLoading ? (
          <Shimmer radius={8} height={20} style={{ width: "100%" }} />
        ) : (
          <PartnerStatusMood
            status={status}
            statusDescription={statusDescription}
            mood={mood || "No mood"}
            moodDescription={moodDescription}
            statusDistance={partnerStatus?.distance}
          />
        )}

        <PartnerAnniversary
          specialDates={specialDates}
          specialDatesLoading={profileLoading}
        />

        {profileLoading ? (
          <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        ) : (
          <PartnerFavorites
            favorites={favoritesObjectToArray(partnerFavorites)}
          />
        )}

        <View style={styles.divider} />

        {profileLoading ? (
          <Shimmer radius={8} height={20} style={{ width: "100%" }} />
        ) : (
          <PartnerLoveLanguage loveLanguage={loveLanguage} />
        )}

        {profileLoading ? (
          <Shimmer radius={8} height={20} style={{ width: "100%" }} />
        ) : (
          <PartnerMoreAboutYou about={partnerAbout} />
        )}

        {profileLoading ? (
          <Shimmer radius={8} height={30} style={{ width: "100%" }} />
        ) : (
          <PartnerMessageStorage
            name={partner?.name}
            messages={partnerStoredMessages}
            onPress={handleViewMessage}
          />
        )}
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

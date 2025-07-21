// external
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
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

// internal
import { getUserFavorites } from "../../../services/favoritesService";
import { getLoveLanguage } from "../../../services/loveLanguageService";
import { getAboutUser } from "../../../services/aboutUserService";
import { removePartner } from "../../../services/partnerService";
import { BASE_URL } from "../../../configuration/config";
import { buildCachedImageUrl } from "../../../utils/imageCacheUtils";

// screen content
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import PartnerMoreAboutYou from "./PartnerMoreAboutYou";
import ProfilePictureViewer from "../ProfilePictureViewer";
import PartnerFavorites from "./PartnerFavorites";
import PartnerLoveLanguage from "./PartnerLoveLanguage";
import PartnerStatusMood from "./PartnerStatusMood";
import PartnerAnniversary from "./PartnerAnniversary";

const PartnerProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [partner, setPartner] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [partnerFavorites, setPartnerFavorites] = useState([]);
  const [partnerLoveLanguage, setPartnerLoveLanguage] = useState<string>("");
  const [partnerAbout, setPartnerAbout] = useState<string>("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removingPartner, setRemovingPartner] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );

  // refresh screen
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPartner();
      await fetchCurrentUser();

      if (partner?.id) {
        await Promise.all([
          fetchPartnerFavorites(partner.id),
          fetchPartnerLoveLanguage(partner.id),
          fetchPartnerAbout(partner.id),
        ]);
      }

      setRefreshKey((k) => k + 1);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, [partner?.id]);

  const fetchPartner = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.get(
        `${BASE_URL}/api/partnership/get-partner`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const partnerData = response.data.partner;
      setPartner(partnerData);

      try {
        const pictureResponse = await axios.get(
          `${BASE_URL}/api/profile/get-profile-picture/${partnerData.id}`,
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
    } catch (err) {
      setPartner(null);
      setAvatarUri(null);
    } finally {
      setLoading(false);
    }
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

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/profile/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUserName(response.data.user.name);
    } catch (err) {}
  };

  const fetchPartnerFavorites = async (partnerId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const favorites = await getUserFavorites(token, partnerId);

      setPartnerFavorites(favorites);
    } catch (err) {
      setPartnerFavorites([]);
    }
  };

  const fetchPartnerLoveLanguage = async (partnerId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const loveLanguage = await getLoveLanguage(token, partnerId);

      setPartnerLoveLanguage(loveLanguage);
    } catch (err) {
      setPartnerLoveLanguage("");
    }
  };

  const fetchPartnerAbout = async (partnerId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const about = await getAboutUser(token, partnerId);

      setPartnerAbout(about);
    } catch (err) {
      setPartnerAbout("");
    }
  };

  const handleRemovePartner = async () => {
    setRemovingPartner(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      await removePartner(token);
      setShowRemoveModal(false);

      navigation.replace("UserProfile", { userId: partner.id });
    } catch (error: any) {
    } finally {
      setRemovingPartner(false);
    }
  };

  const FAVORITE_LABELS: { [key: string]: string } = {
    favoriteColor: "Favorite Color",
    favoriteFood: "Favorite Food",
    favoriteSnack: "Favorite Snack",
    favoriteActivity: "Favorite Activity",
    favoriteHoliday: "Favorite Holiday",
    favoriteTimeOfDay: "Favorite Time of Day",
    favoriteSeason: "Favorite Season",
    favoriteAnimal: "Favorite Animal",
    favoriteDrink: "Favorite Drink",
    favoritePet: "Favorite Pet",
    favoriteShow: "Favorite Show",
  };

  // helpers
  function favoritesObjectToArray(
    favoritesObj: any
  ): { label: string; value: string }[] {
    return Object.entries(FAVORITE_LABELS)
      .map(([key, label]) =>
        favoritesObj[key] ? { label, value: favoritesObj[key] } : null
      )
      .filter(Boolean) as { label: string; value: string }[];
  }

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
    (async () => {
      setLoading(true);

      await fetchPartner();
      await fetchCurrentUser();

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (partner?.id) {
      fetchPartnerFavorites(partner.id);
      fetchPartnerLoveLanguage(partner.id);
      fetchPartnerAbout(partner.id);
    }
  }, [partner?.id]);

  // declarations
  const name = partner?.name || "User";
  const username = partner?.username || "user";
  const bio = partner?.bio || "";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
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
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color="#5ad1e6" size="large" />
          </View>
        )}
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

        <PartnerAnniversary partnerId={partner.id} />

        <PartnerFavorites
          favorites={favoritesObjectToArray(partnerFavorites)}
        />

        <View style={styles.divider} />

        <PartnerLoveLanguage loveLanguage={partnerLoveLanguage} />

        <PartnerMoreAboutYou about={partnerAbout} />

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
      </ScrollView>

      <ProfilePictureViewer
        visible={showPictureViewer}
        imageUri={
          partner && profilePicUpdatedAt
            ? buildCachedImageUrl(partner.id, profilePicUpdatedAt)
            : null
        }
        onClose={() => setShowPictureViewer(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    paddingHorizontal: 16,
  },
  portalIcon: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 100,
    backgroundColor: "#23243a",
    borderRadius: 20,
    padding: 4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 0,
  },
  avatarWrapper: {
    marginRight: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#e03487",
    backgroundColor: "#444",
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#393a4a",
    marginVertical: 0,
    opacity: 1,
  },
  partnerRow: {
    marginBottom: 20,
    marginLeft: 2,
    alignItems: "center",
    marginTop: 20,
  },
  partnerText: {
    color: "#b0b3c6",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  partnerName: {
    color: "rgb(155, 158, 180)",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    backgroundColor: "#e02222",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default PartnerProfileScreen;

// external
import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { encode } from "base64-arraybuffer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import type { StackScreenProps } from "@react-navigation/stack";

// internal
import { fetchUserStatus } from "../../services/userStatusService";
import { getMood } from "../../services/moodService";
import UpdateFavoritesModal from "../../components/modals/UpdateFavoritesModal";
import {
  getUserFavorites,
  updateUserFavorites,
} from "../../services/favoritesService";
import { BASE_URL } from "../../configuration/config";
import {
  getLoveLanguage,
  updateLoveLanguage,
} from "../../services/loveLanguageService";
import { getAboutUser, updateAboutUser } from "../../services/aboutUserService";
import { getPartner } from "../../services/partnerService";
import { getReceivedPartnerRequests } from "../../services/partnerService";
import { buildCachedImageUrl } from "../../utils/imageCacheUtils";

// screen content
import UpdateAboutModal from "../../components/modals/UpdateAboutModal";
import UpdateLoveLanguageModal from "../../components/modals/UpdateLoveLanguageModal";
import ProfilePictureModal from "./ProfilePictureModal";
import ProfilePictureViewer from "./ProfilePictureViewer";
import StatusMood from "./StatusMood";
import Anniversary from "./Anniversary";
import Favorites from "./Favorites";
import LoveLanguage from "./LoveLanguage";
import MoreAboutYou from "./MoreAboutYou";

// types
type ProfileScreenProps = StackScreenProps<any, any>;

type FavoritesType = {
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteSnack?: string;
  favoriteActivity?: string;
  favoriteHoliday?: string;
  favoriteTimeOfDay?: string;
  favoriteSeason?: string;
  favoriteAnimal?: string;
  favoriteDrink?: string;
  favoritePet?: string;
  favoriteShow?: string;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;

  // use states
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );

  // use states (modals)
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [loveLanguageModalVisible, setLoveLanguageModalVisible] =
    useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalBio, setOriginalBio] = useState("");

  // use states (screen content)
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoritesType>({});
  const [homeStatus, setHomeStatus] = useState<
    "home" | "away" | "unreachable" | "unavailable"
  >("unavailable");
  const [statusDescription, setStatusDescription] = useState<string>(
    "You must add your home location to use this feature."
  );
  const [mood, setMood] = useState<string>();
  const [moodDescription, setMoodDescription] = useState<string>();
  const [loveLanguage, setLoveLanguage] = useState("");
  const [about, setAbout] = React.useState<string>("");
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // arrays
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

  function favoritesObjectToArray(
    favoritesObj: any
  ): { label: string; value: string }[] {
    return Object.entries(FAVORITE_LABELS)
      .map(([key, label]) =>
        favoritesObj[key] ? { label, value: favoritesObj[key] } : null
      )
      .filter(Boolean) as { label: string; value: string }[];
  }

  // refresh screen
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchLoveLanguage(),
        fetchProfile(),
        getStatus(),
        fetchPendingRequestsCount(),
        fetchFavorites(),
        fetchPartnerName(),
        fetchMood(),
        fetchAbout(),
      ]);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, []);

  // fetch functions
  const fetchLoveLanguage = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = user?.id;

    if (!token || !userId) {
      setError("Session expired, please log in again");
      return;
    }

    try {
      const ll = await getLoveLanguage(token, userId);

      setLoveLanguage(ll);
    } catch {
      setLoveLanguage("");
    }
  };

  const getStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token || !user?.id) {
        setHomeStatus("unavailable");
        setStatusDescription(
          "You must add your home location to use this feature."
        );

        return;
      }

      const status = await fetchUserStatus(token, user.id);

      if (
        status &&
        (typeof status.isAtHome === "boolean" ||
          typeof status.unreachable === "boolean")
      ) {
        if (status.unreachable) {
          setHomeStatus("unreachable");
          setStatusDescription("Can't find your current location");
        } else if (status.isAtHome) {
          setHomeStatus("home");
          setStatusDescription("You are currently at home");
        } else {
          setHomeStatus("away");
          setStatusDescription("You're currently not home");
        }
      } else {
        setHomeStatus("unavailable");
        setStatusDescription(
          "You must add your home location to use this feature"
        );
      }
    } catch (err: any) {
      setHomeStatus("unavailable");
      setStatusDescription(
        "You must add your home location to use this feature"
      );
    }
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const requests = await getReceivedPartnerRequests(token);
      const pendingCount = requests.filter(
        (req: any) => req.status === "pending"
      ).length;

      setPendingRequestsCount(pendingCount);
    } catch (error) {}
  };

  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = user?.id;

    if (!token || !userId) {
      setError("Session expired, please log in again");
      return;
    }

    const favs = await getUserFavorites(token, userId);
    setFavorites(favs);
  };

  const fetchPartnerName = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    try {
      const partner = await getPartner(token);

      setPartnerName(partner?.name || null);
    } catch (err: any) {
      setPartnerName(null);
    }
  };

  const fetchMood = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    const moodData = await getMood(token);

    setMood(moodData.mood);
    setMoodDescription(moodData.description);
  };
  fetchMood();

  const fetchAbout = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = user?.id;

    if (!token || !userId) {
      setError("Session expired, please log in again");
      return;
    }

    try {
      const aboutText = await getAboutUser(token, userId);

      setAbout(aboutText);
    } catch {
      setAbout("");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/profile/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);

      setEditName(response.data.user.name || "");
      setEditUsername(response.data.user.username || "");
      setEditBio(response.data.user.bio || "");

      setOriginalName(response.data.user.name || "");
      setOriginalUsername(response.data.user.username || "");
      setOriginalBio(response.data.user.bio || "");

      const userId = response.data.user.id;

      try {
        const pictureResponse = await axios.get(
          `${BASE_URL}/api/profile/get-profile-picture/${userId}`,
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
        if (picErr.response?.status !== 404) {
          setError(picErr.response?.data?.error || picErr.message);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // helpers
  const renderProfileImage = () => {
    if (avatarUri && profilePicUpdatedAt) {
      const cachedImageUrl = buildCachedImageUrl(user.id, profilePicUpdatedAt);

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
            ? { uri: avatarUri }
            : require("../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

  // use effects
  useEffect(() => {
    fetchLoveLanguage();
  }, [user]);

  useEffect(() => {
    fetchPendingRequestsCount();
  }, []);

  useEffect(() => {
    if (user?.id) {
      getStatus();
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    fetchPartnerName();
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchAbout();
  }, [user]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setShowError(true);

      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // handlers
  const handleSaveLoveLanguage = async (newLoveLanguage: string) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    await updateLoveLanguage(token, newLoveLanguage);
    setLoveLanguage(newLoveLanguage);
  };

  const handleSaveAbout = async (newAbout: string) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    await updateAboutUser(token, newAbout);
    setAbout(newAbout);
  };

  const handleAvatarPress = () => {
    setShowPictureModal(true);
  };

  const handleSaveFavorites = async (newFavorites: FavoritesType) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    await updateUserFavorites(token, newFavorites);
    setFavorites(newFavorites);
  };

  const handleViewCurrentPicture = () => {
    setShowPictureModal(false);
    setShowPictureViewer(true);
  };

  const handleSelectNewPicture = async () => {
    setShowPictureModal(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      try {
        setLoading(true);

        if (result.assets[0].base64.length > 10 * 1024 * 1024) {
          setError("Image is too large. Make sure it's less than 10 MB.");

          return;
        }

        const token = await AsyncStorage.getItem("token");
        const userId = user.id;

        const mimeType = result.assets[0].mimeType || "image/jpeg";
        const base64String = `data:${mimeType};base64,${result.assets[0].base64}`;

        await axios.put(
          `${BASE_URL}/api/profile/update-profile-picture`,
          { image: base64String },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccess("Profile picture uploaded!");
        await fetchProfile();
      } catch (err: any) {
        if (
          err.response?.data?.error?.includes("PayloadTooLarge") ||
          err.message?.includes("PayloadTooLarge")
        ) {
          setError("Image is too large. Make sure is less than 10 MB.");
        } else {
          setError("Failed to upload profile picture");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveField = async (
    field: "name" | "username" | "bio",
    value: string
  ) => {
    try {
      if (field === "name") {
        setLoadingName(true);
      }
      if (field === "username") {
        setLoadingUsername(true);
      }
      if (field === "bio") {
        setLoadingBio(true);
      }

      const token = await AsyncStorage.getItem("token");
      let url = "";
      let body = {};

      if (field === "name") {
        url = `${BASE_URL}/api/profile/update-name`;
        body = { name: value };
      } else if (field === "username") {
        url = `${BASE_URL}/api/profile/update-username`;
        body = { username: value };
      } else if (field === "bio") {
        url = `${BASE_URL}/api/profile/update-bio`;
        body = { bio: value };
      }

      await axios.put(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchProfile();
    } catch (err: any) {
      setError(`Failed to update ${field}`);
    } finally {
      if (field === "name") {
        setLoadingName(false);
      }

      if (field === "username") {
        setLoadingUsername(false);
      }

      if (field === "bio") {
        setLoadingBio(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>No profile data. Try logging in again</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <View
        style={{
          backgroundColor: "#23243a",
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            letterSpacing: 0,
          }}
        >
          Profile
        </Text>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            left: 18,
            zIndex: 10,
            backgroundColor: "#23243a",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("PendingRequests")}
        >
          <Feather name="users" size={22} color="#fff" />
          {pendingRequestsCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: "#e03487",
                borderRadius: 10,
                paddingHorizontal: 5,
                paddingVertical: 1,
                minWidth: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            right: 18,
            zIndex: 10,
            backgroundColor: "#23243a",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="settings" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
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
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleAvatarPress}
          >
            {renderProfileImage()}
          </TouchableOpacity>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.bio}>{user.bio || ""}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Feather name="edit-2" size={22} color="#e03487" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.partnerRow}>
          <Text style={styles.partnerText}>
            Partner:{" "}
            <Text
              style={
                partnerName && partnerName !== "No partner"
                  ? styles.partnerName
                  : styles.noPartnerName
              }
            >
              {partnerName || "No partner"}
            </Text>
          </Text>
        </View>

        <StatusMood
          status={homeStatus}
          statusDescription={statusDescription}
          mood={mood}
          moodDescription={moodDescription}
        />

        <Anniversary
          anniversaryDate="22 September 2024"
          dayMet="12 September 2024"
          onEditAnniversary={() => {}}
          onEditDayMet={() => {}}
        />

        <Favorites
          favorites={favoritesObjectToArray(favorites)}
          onEdit={() => setFavoritesModalVisible(true)}
        />

        <UpdateFavoritesModal
          visible={favoritesModalVisible}
          initialFavorites={favorites}
          onClose={() => setFavoritesModalVisible(false)}
          onSave={handleSaveFavorites}
        />

        <View style={styles.divider} />

        <LoveLanguage
          loveLanguage={loveLanguage}
          onEdit={() => setLoveLanguageModalVisible(true)}
        />
        <UpdateLoveLanguageModal
          visible={loveLanguageModalVisible}
          initialLoveLanguage={loveLanguage}
          onClose={() => setLoveLanguageModalVisible(false)}
          onSave={handleSaveLoveLanguage}
        />

        <MoreAboutYou about={about} onEdit={() => setAboutModalVisible(true)} />
        <UpdateAboutModal
          visible={aboutModalVisible}
          initialAbout={about}
          onClose={() => setAboutModalVisible(false)}
          onSave={handleSaveAbout}
        />

        <Modal
          visible={editModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <BlurView intensity={0} style={StyleSheet.absoluteFill}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit profile</Text>
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      value={editName}
                      onChangeText={setEditName}
                      placeholderTextColor="#b0b3c6"
                    />
                    {editName !== originalName && (
                      <TouchableOpacity
                        style={styles.tickIcon}
                        onPress={() => handleSaveField("name", editName)}
                        disabled={loadingName}
                      >
                        {loadingName ? (
                          <ActivityIndicator size={22} color="#4caf50" />
                        ) : (
                          <Feather name="check" size={22} color="#4caf50" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.editRow}>
                    <Text style={styles.atSymbol}>@</Text>
                    <TextInput
                      style={styles.inputWithAt}
                      placeholder="username"
                      value={editUsername}
                      onChangeText={(text) =>
                        setEditUsername(text.replace(/^@+/, ""))
                      }
                      placeholderTextColor="#b0b3c6"
                      autoCapitalize="none"
                    />
                    {editUsername !== originalUsername && (
                      <TouchableOpacity
                        style={styles.tickIcon}
                        onPress={() =>
                          handleSaveField(
                            "username",
                            editUsername.replace(/^@/, "")
                          )
                        }
                        disabled={loadingUsername}
                      >
                        {loadingUsername ? (
                          <ActivityIndicator size={22} color="#4caf50" />
                        ) : (
                          <Feather name="check" size={22} color="#4caf50" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="Bio"
                      value={editBio}
                      onChangeText={setEditBio}
                      placeholderTextColor="#b0b3c6"
                    />
                    {editBio !== originalBio && (
                      <TouchableOpacity
                        style={styles.tickIcon}
                        onPress={() => handleSaveField("bio", editBio)}
                        disabled={loadingBio}
                      >
                        {loadingBio ? (
                          <ActivityIndicator size={22} color="#4caf50" />
                        ) : (
                          <Feather name="check" size={22} color="#4caf50" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <ProfilePictureModal
          visible={showPictureModal}
          onClose={() => setShowPictureModal(false)}
          onSelectNew={handleSelectNewPicture}
          onViewCurrent={handleViewCurrentPicture}
        />

        <ProfilePictureViewer
          visible={showPictureViewer}
          imageUri={
            user && profilePicUpdatedAt
              ? buildCachedImageUrl(user.id, profilePicUpdatedAt)
              : null
          }
          onClose={() => setShowPictureViewer(false)}
        />
      </ScrollView>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}

      {showSuccess && (
        <View style={[styles.toast, { backgroundColor: "#4caf50" }]}>
          <Text style={styles.toastText}>{success}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
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
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#e03487",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#23243a",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  editButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#393a4a",
    marginVertical: 24,
    opacity: 1,
  },
  partnerRow: {
    marginBottom: 20,
    marginLeft: 2,
    alignItems: "center",
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
  noPartnerName: {
    color: "rgb(155, 158, 180)",
    fontWeight: "normal",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    marginTop: 120,
    marginHorizontal: 24,
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 24,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    alignSelf: "center",
  },
  atSymbol: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -10 }],
    color: "#b0b3c6",
    fontSize: 16,
    zIndex: 2,
    paddingLeft: 2,
  },
  inputWithAt: {
    backgroundColor: "transparent",
    color: "#fff",
    borderRadius: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e03487",
    width: "100%",
    fontSize: 16,
    paddingLeft: 18,
    paddingRight: 36,
  },
  editRow: {
    width: "100%",
    marginBottom: 40,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "transparent",
    color: "#fff",
    borderRadius: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e03487",
    width: "100%",
    fontSize: 16,
    paddingRight: 36,
  },
  tickIcon: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -11 }],
    zIndex: 2,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: "#e03487",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    top: 50,
    // bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProfileScreen;

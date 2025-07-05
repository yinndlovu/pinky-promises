import React, { useLayoutEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../configuration/config";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { encode } from "base64-arraybuffer";
import StatusMood from "./StatusMood";
import Anniversary from "./Anniversary";
import Favorites from "./Favorites";
import LoveLanguage from "./LoveLanguage";
import MoreAboutYou from "./MoreAboutYou";
import type { StackScreenProps } from "@react-navigation/stack";
import ProfilePictureModal from "./ProfilePictureModal";
import ProfilePictureViewer from "./ProfilePictureViewer";
import { fetchUserStatus } from "../../services/userStatusService";
import { getMood } from "../../services/moodService";
import UpdateFavoritesModal from "../../components/modals/UpdateFavoritesModal";
import {
  getUserFavorites,
  updateUserFavorites,
} from "../../services/favoritesService";
import UpdateLoveLanguageModal from "../../components/modals/UpdateLoveLanguageModal";
import {
  getLoveLanguage,
  updateLoveLanguage,
} from "../../services/loveLanguageService";
import UpdateAboutModal from "../../components/modals/UpdateAboutModal";
import { getAboutUser, updateAboutUser } from "../../services/aboutUserService";
import { getPartner } from "../../services/partnerService";
import { getReceivedPartnerRequests } from "../../services/partnerService";

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
  const [user, setUser] = React.useState<any>(null);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const [editName, setEditName] = React.useState("");
  const [editUsername, setEditUsername] = React.useState("");
  const [editBio, setEditBio] = React.useState("");

  const [originalName, setOriginalName] = React.useState("");
  const [originalUsername, setOriginalUsername] = React.useState("");
  const [originalBio, setOriginalBio] = React.useState("");

  const [loadingName, setLoadingName] = React.useState(false);
  const [loadingUsername, setLoadingUsername] = React.useState(false);
  const [loadingBio, setLoadingBio] = React.useState(false);

  const [showPictureModal, setShowPictureModal] = React.useState(false);
  const [showPictureViewer, setShowPictureViewer] = React.useState(false);

  const [favoritesModalVisible, setFavoritesModalVisible] =
    React.useState(false);
  const [favorites, setFavorites] = React.useState<FavoritesType>({});

  const [homeStatus, setHomeStatus] = React.useState<
    "home" | "away" | "unavailable"
  >("unavailable");
  const [statusDescription, setStatusDescription] = React.useState<string>(
    "You must add your home location to use this feature."
  );

  const [mood, setMood] = React.useState<string>();
  const [moodDescription, setMoodDescription] = React.useState<string>();

  const [loveLanguageModalVisible, setLoveLanguageModalVisible] =
    React.useState(false);
  const [loveLanguage, setLoveLanguage] = React.useState("");

  const [about, setAbout] = React.useState<string>("");
  const [aboutModalVisible, setAboutModalVisible] = React.useState(false);

  const [partnerName, setPartnerName] = React.useState<string | null>(null);

  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("PendingRequests")}
          style={{ marginLeft: 20, position: "relative" }}
        >
          <Feather name="users" size={24} color="#fff" />
          {pendingRequestsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={{ marginRight: 20 }}
        >
          <Feather name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerShown: true,
      title: "",
      headerTransparent: true,
      headerTintColor: "#fff",
      headerStyle: {
        backgroundColor: "transparent",
      },
      headerShadowVisible: false,
    });
  }, [navigation, pendingRequestsCount]);

  React.useEffect(() => {
    const fetchLoveLanguage = async () => {
      const token = await AsyncStorage.getItem("token");
      const userId = user?.id;
      if (!token || !userId) return;
      try {
        const ll = await getLoveLanguage(token, userId);
        setLoveLanguage(ll);
      } catch {
        setLoveLanguage("");
      }
    };
    fetchLoveLanguage();
  }, [user]);

  const handleSaveLoveLanguage = async (newLoveLanguage: string) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    await updateLoveLanguage(token, newLoveLanguage);
    setLoveLanguage(newLoveLanguage);
  };

  const handleSaveAbout = async (newAbout: string) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    await updateAboutUser(token, newAbout);
    setAbout(newAbout);
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const requests = await getReceivedPartnerRequests(token);
      const pendingCount = requests.filter(
        (req: any) => req.status === "pending"
      ).length;
      setPendingRequestsCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch pending requests count:", error);
    }
  };

  React.useEffect(() => {
    fetchPendingRequestsCount();
  }, []);

  React.useEffect(() => {
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
        if (status && typeof status.isAtHome === "boolean") {
          if (status.isAtHome) {
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

    if (user?.id) {
      getStatus();
    }
  }, [user]);

  React.useEffect(() => {
    const fetchFavorites = async () => {
      const token = await AsyncStorage.getItem("token");
      const userId = user?.id;
      if (!token || !userId) return;
      const favs = await getUserFavorites(token, userId);
      setFavorites(favs);
    };
    fetchFavorites();
  }, [user]);

  React.useEffect(() => {
    const fetchPartnerName = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      try {
        const partner = await getPartner(token);
        setPartnerName(partner?.name || null);
      } catch (err: any) {
        setPartnerName(null);
      }
    };
    fetchPartnerName();
  }, [user]);

  React.useEffect(() => {
    const fetchMood = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const moodData = await getMood(token);
      setMood(moodData.mood);
      setMoodDescription(moodData.description);
    };
    fetchMood();
  }, []);

  React.useEffect(() => {
    const fetchAbout = async () => {
      const token = await AsyncStorage.getItem("token");
      const userId = user?.id;
      if (!token || !userId) return;
      try {
        const aboutText = await getAboutUser(token, userId);
        setAbout(aboutText);
      } catch {
        setAbout("");
      }
    };
    if (user?.id) fetchAbout();
  }, [user]);

  React.useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error) {
      setShowError(true);

      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
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

  const handleAvatarPress = () => {
    setShowPictureModal(true);
  };

  const handleSaveFavorites = async (newFavorites: FavoritesType) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
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
        fetchProfile();
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
      if (field === "name") setLoadingName(false);
      if (field === "username") setLoadingUsername(false);
      if (field === "bio") setLoadingBio(false);
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
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>No profile data.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleAvatarPress}
          >
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require("../../assets/default-avatar-two.png")
              }
              style={styles.avatar}
            />
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
          <View style={styles.modalOverlay}>
            <BlurView intensity={0} style={StyleSheet.absoluteFill}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
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
        </Modal>
        <ProfilePictureModal
          visible={showPictureModal}
          onClose={() => setShowPictureModal(false)}
          onSelectNew={handleSelectNewPicture}
          onViewCurrent={handleViewCurrentPicture}
        />

        <ProfilePictureViewer
          visible={showPictureViewer}
          imageUri={avatarUri}
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
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 36,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
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

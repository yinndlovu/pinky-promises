// external
import React, { useState, useEffect, useCallback } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { fetchUserStatus } from "../../../../services/api/profiles/userStatusService";
import { getMood } from "../../../../services/api/profiles/moodService";
import UpdateFavoritesModal from "../../../../components/modals/input/UpdateFavoritesModal";
import {
  getUserFavorites,
  updateUserFavorites,
} from "../../../../services/api/profiles/favoritesService";
import { BASE_URL } from "../../../../configuration/config";
import {
  getLoveLanguage,
  updateLoveLanguage,
} from "../../../../services/api/profiles/loveLanguageService";
import {
  getAboutUser,
  updateAboutUser,
} from "../../../../services/api/profiles/aboutUserService";
import { getPartner, getReceivedPartnerRequests } from "../../../../services/api/profiles/partnerService";
import { buildCachedImageUrl } from "../../../../utils/imageCacheUtils";
import { FavoritesType } from "../../../../types/Favorites";
import { favoritesObjectToArray } from "../../../../helpers/profileHelpers";
import {
  storeMessage,
  getStoredMessages,
  updateMessage,
  deleteMessage,
} from "../../../../services/api/profiles/messageStorageService";

// screen content
import UpdateAboutModal from "../../../../components/modals/input/UpdateAboutModal";
import UpdateLoveLanguageModal from "../../../../components/modals/input/UpdateLoveLanguageModal";
import ProfilePictureModal from "../../../../components/modals/selection/ProfilePictureModal";
import ProfilePictureViewer from "../../../../components/modals/output/ProfilePictureViewer";
import StatusMood from "../components/StatusMood";
import Anniversary from "../components/Anniversary";
import Favorites from "../components/Favorites";
import LoveLanguage from "../components/LoveLanguage";
import MoreAboutYou from "../components/MoreAboutYou";
import styles from "../styles/ProfileScrees.styles";
import MessageStorage from "../components/MessageStorage";
import StoreMessageModal from "../../../../components/modals/input/StoreMessageModal";
import AlertModal from "../../../../components/modals/output/AlertModal";
import ConfirmationModal from "../../../../components/modals/selection/ConfirmationModal";
import ViewMessageModal from "../../../../components/modals/output/ViewMessageModal";
import modalStyles from "../styles/ModalStyles.styles";
import LoadingSpinner from "../../../../components/loading/LoadingSpinner";

// types
type ProfileScreenProps = StackScreenProps<any, any>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const queryClient = useQueryClient();

  // use states
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );

  // use states (processing)
  const [loadingName, setLoadingName] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // use states (modals)
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPictureViewer, setShowPictureViewer] = useState(false);
  const [favoritesModalVisible, setFavoritesModalVisible] = useState(false);
  const [loveLanguageModalVisible, setLoveLanguageModalVisible] =
    useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [storeMessageModalVisible, setStoreMessageModalVisible] =
    useState(false);
  const [storingMessage, setStoringMessage] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [editMessageModalVisible, setEditMessageModalVisible] = useState(false);

  // use states (edit fields)
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  // use states (message storage)
  const [viewMessageModalVisible, setViewMessageModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<
    (() => void) | null
  >(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessageText, setEditMessageText] = useState("");

  // fetch functions
  const {
    data: profileData,
    isLoading: profileDataLoading,
    refetch: refetchProfileData,
  } = useQuery({
    queryKey: ["profileData"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/profile/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.user;
    },
    staleTime: 1000 * 60 * 60 * 24 * 2,
  });

  const {
    data: loveLanguage,
    isLoading: loveLanguageLoading,
    refetch: refetchLoveLanguage,
  } = useQuery({
    queryKey: ["loveLanguage", profileData?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      return await getLoveLanguage(token, profileData?.id);
    },
    enabled: !!profileData?.id,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const {
    data: status,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["status", profileData?.id],
    queryFn: async () => {
      if (!profileData?.id) {
        return null;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await fetchUserStatus(token, profileData?.id);
    },
    enabled: !!profileData?.id,
    staleTime: 1000 * 60 * 4,
  });

  const homeStatus = status?.unreachable
    ? "unreachable"
    : status?.isAtHome
    ? "home"
    : status?.isAtHome === false
    ? "away"
    : "unavailable";

  const statusDescription = status?.unreachable
    ? "Can't find your current location"
    : status?.isAtHome
    ? "You are currently at home"
    : status?.isAtHome === false
    ? "You are currently not home"
    : "You must add your home location to use this feature";

  const {
    data: pendingRequestsData,
    isLoading: pendingRequestsDataLoading,
    refetch: refetchPendingRequestsData,
  } = useQuery({
    queryKey: ["pendingRequestCount", profileData?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      return await getReceivedPartnerRequests(token);
    },
    enabled: !!profileData?.id,
    staleTime: 1000 * 60 * 5,
  });

  const pendingRequestsCount = pendingRequestsData?.filter(
    (req: any) => req.status === "pending"
  ).length;

  const {
    data: favorites = {},
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ["favorites", profileData?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      const userId = profileData?.id;

      if (!token || !userId) {
        return {};
      }

      return await getUserFavorites(token, userId);
    },
    enabled: !!profileData?.id,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: partnerData,
    isLoading: partnerDataLoading,
    refetch: refetchPartnerData,
  } = useQuery({
    queryKey: ["partnerData"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      return await getPartner(token);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const {
    data: moodData,
    isLoading: moodDataLoading,
    refetch: refetchMoodData,
  } = useQuery({
    queryKey: ["moodData", profileData?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      return await getMood(token);
    },
    enabled: !!profileData?.id,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: about,
    isLoading: aboutLoading,
    refetch: refetchAbout,
  } = useQuery({
    queryKey: ["about", profileData?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      return await getAboutUser(token, profileData?.id);
    },
    enabled: !!profileData?.id,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const fetchProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token || !profileData?.id) {
        return;
      }

      const pictureResponse = await axios.get(
        `${BASE_URL}/api/profile/get-profile-picture/${profileData?.id}`,
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
  };

  const {
    data: storedMessages = [],
    isLoading: storedMessagesLoading,
    refetch: refetchStoredMessages,
  } = useQuery({
    queryKey: ["storedMessages"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await getStoredMessages(token);
      return Array.isArray(response) ? response : [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const storeMessageMutation = useMutation({
    mutationFn: async ({
      title,
      message,
    }: {
      title: string;
      message: string;
    }) => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      return await storeMessage(token, title, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storedMessages"] });

      setStoreMessageModalVisible(false);
      setAlertMessage("Message stored");
      setAlertVisible(true);
    },
    onError: (error: any) => {
      setAlertMessage(error.response?.data?.error || "Failed to store message");
      setAlertVisible(true);
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      title,
      message,
    }: {
      messageId: string;
      title: string;
      message: string;
    }) => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      return await updateMessage(token, messageId, title, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storedMessages"] });

      setEditMessageModalVisible(false);
      setEditingMessage(null);
      setEditTitle("");
      setEditMessageText("");
      setAlertMessage("Message updated");
      setAlertVisible(true);
    },
    onError: (error: any) => {
      setAlertMessage(error.response?.data?.error || "Failed to update message");
      setAlertVisible(true);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      return await deleteMessage(token, messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storedMessages"] });

      setConfirmationVisible(false);
      setAlertMessage("Message deleted");
      setAlertVisible(true);
    },
    onError: (error: any) => {
      setAlertMessage(error.response?.data?.error || "Failed to delete message");
      setAlertVisible(true);
    },
  });

  // helpers
  const renderProfileImage = () => {
    if (avatarUri && profilePicUpdatedAt) {
      const cachedImageUrl = buildCachedImageUrl(profileData?.id, profilePicUpdatedAt);

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
            : require("../../../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

  // use effects
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 4000);
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
    if (profileData?.id) {
      fetchProfilePicture();
    }
  }, [profileData?.id]);

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
      await Promise.all([
        refetchLoveLanguage(),
        refetchProfileData(),
        refetchStatus(),
        refetchPendingRequestsData(),
        refetchFavorites(),
        refetchPartnerData(),
        refetchMoodData(),
        refetchAbout(),
        fetchProfilePicture(),
        refetchStoredMessages(),
      ]);

      await queryClient.invalidateQueries({
        queryKey: ["specialDates"],
      });
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchLoveLanguage,
    refetchPartnerData,
    refetchAbout,
    refetchMoodData,
    refetchFavorites,
    refetchStatus,
    refetchProfileData,
    refetchPendingRequestsData,
    fetchProfilePicture,
    refetchStoredMessages,
  ]);

  // handlers
  const handleSaveLoveLanguage = async (newLoveLanguage: string) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    try {
      await updateLoveLanguage(token, newLoveLanguage);

      await queryClient.invalidateQueries({
        queryKey: ["loveLanguage", profileData?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", profileData?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities"],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save love language");
    }
  };

  const handleSaveAbout = async (newAbout: string) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    try {
      await updateAboutUser(token, newAbout);

      await queryClient.invalidateQueries({
        queryKey: ["about", profileData?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", profileData?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities"],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save about");
    }
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

    try {
      await updateUserFavorites(token, newFavorites);

      await queryClient.invalidateQueries({
        queryKey: ["favorites", profileData?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", profileData?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save favorites");
    }
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
        if (result.assets[0].base64.length > 10 * 1024 * 1024) {
          setError("Image is too large. Make sure it's less than 10 MB.");

          return;
        }

        setUploading(true);

        const token = await AsyncStorage.getItem("token");
        const userId = profileData?.id;

        const mimeType = result.assets[0].mimeType || "image/jpeg";
        const base64String = `data:${mimeType};base64,${result.assets[0].base64}`;

        await axios.put(
          `${BASE_URL}/api/profile/update-profile-picture`,
          { image: base64String },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccess("Profile picture uploaded");
        await fetchProfilePicture();
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
        setUploading(false);
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

      await queryClient.invalidateQueries({
        queryKey: ["profileData"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", profileData?.id],
      });
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

  function handleAddMessage() {
    setStoreMessageModalVisible(true);
  }

  const handleStoreMessage = async (title: string, message: string) => {
    setStoringMessage(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      await storeMessage(token, title, message);
      setAlertMessage("Message stored");
      setStoreMessageModalVisible(false);
      setAlertVisible(true);
    } catch (error: any) {
      setAlertMessage(error.response?.data?.error || "Failed to store message");
      setStoreMessageModalVisible(false);
      setAlertVisible(true);
    } finally {
      setStoringMessage(false);
    }
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setViewMessageModalVisible(true);
  };

  const handleLongPressMessage = (message: any) => {
    setSelectedMessage(message);
    setConfirmationMessage("What would you like to do with this message?");
    setConfirmationAction(() => () => {});
    setConfirmationVisible(true);
  };

  const handleEditMessage = () => {
    if (!selectedMessage) return;

    setEditingMessage(selectedMessage);
    setEditTitle(selectedMessage.title);
    setEditMessageText(selectedMessage.message);
    setEditMessageModalVisible(true);
    setConfirmationVisible(false);
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage) return;

    setConfirmationMessage("Are you sure you want to delete this message?");
    setConfirmationAction(
      () => () => deleteMessageMutation.mutate(selectedMessage.id)
    );
    setConfirmationVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !editTitle.trim() || !editMessageText.trim()) {
      setAlertMessage("Please fill in all fields");
      setAlertVisible(true);
      return;
    }

    updateMessageMutation.mutate({
      messageId: editingMessage.id,
      title: editTitle.trim(),
      message: editMessageText.trim(),
    });
  };

  // fiels for editing
  const originalName = profileData?.name || "";
  const originalUsername = profileData?.username || "";
  const originalBio = profileData?.bio || "";

  if (profileDataLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

  if (!profileData && !profileDataLoading) {
    return (
      <View style={styles.centered}>
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
          contentContainerStyle={styles.centered}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            Something went wrong viewing your profile
          </Text>
        </ScrollView>
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
            <Text style={styles.name}>{profileData?.name || ""}</Text>
            <Text style={styles.username}>@{profileData?.username || ""}</Text>
            <Text style={styles.bio}>{profileData?.bio || ""}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditName(profileData?.name || "");
              setEditUsername(profileData?.username || "");
              setEditBio(profileData?.bio || "");
              setEditModalVisible(true);
            }}
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
                partnerData?.name && partnerData?.name !== "No partner"
                  ? styles.partnerName
                  : styles.noPartnerName
              }
            >
              {partnerData?.name || "No partner"}
            </Text>
          </Text>
        </View>

        <StatusMood
          status={homeStatus}
          statusDescription={statusDescription}
          mood={moodData?.mood}
          moodDescription={moodData?.description}
          onEdit={() => refetchMoodData()}
          onAddHome={() => {
            refetchStatus();
          }}
        />

        <Anniversary onEditAnniversary={() => {}} onEditDayMet={() => {}} />

        <Favorites
          favorites={favoritesObjectToArray(favorites)}
          onEdit={() => setFavoritesModalVisible(true)}
        />

        <View style={styles.divider} />

        <LoveLanguage
          loveLanguage={loveLanguage}
          onEdit={() => setLoveLanguageModalVisible(true)}
        />

        <MoreAboutYou about={about} onEdit={() => setAboutModalVisible(true)} />

        <MessageStorage
          name={partnerData?.name || "No one"}
          messages={storedMessages}
          onAdd={handleAddMessage}
          onLongPress={handleLongPressMessage}
          onPress={handleViewMessage}
        />

        <View style={{ zIndex: 1000 }}>
          <UpdateFavoritesModal
            visible={favoritesModalVisible}
            initialFavorites={favorites}
            onClose={() => setFavoritesModalVisible(false)}
            onSave={handleSaveFavorites}
          />

          <UpdateLoveLanguageModal
            visible={loveLanguageModalVisible}
            initialLoveLanguage={loveLanguage}
            onClose={() => setLoveLanguageModalVisible(false)}
            onSave={handleSaveLoveLanguage}
          />

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
            <TouchableWithoutFeedback
              onPress={() => setEditModalVisible(false)}
            >
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

          <Modal
            visible={editMessageModalVisible}
            transparent
            animationType="slide"
          >
            <TouchableWithoutFeedback
              onPress={() => setEditMessageModalVisible(false)}
            >
              <View style={modalStyles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={modalStyles.modalContent}>
                    <View style={modalStyles.modalHeader}>
                      <Text style={modalStyles.modalTitle}>Edit message</Text>
                      <TouchableOpacity
                        onPress={() => setEditMessageModalVisible(false)}
                        style={modalStyles.closeButton}
                      >
                        <Feather name="x" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>

                    <View style={modalStyles.form}>
                      <Text style={modalStyles.label}>Message title</Text>
                      <TextInput
                        style={modalStyles.input}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Message title..."
                        placeholderTextColor="#b0b3c6"
                        maxLength={50}
                      />

                      <Text style={modalStyles.label}>Message</Text>
                      <TextInput
                        value={editMessageText}
                        onChangeText={setEditMessageText}
                        placeholder="Type the message here..."
                        placeholderTextColor="#b0b3c6"
                        multiline
                        maxLength={1000}
                        textAlignVertical="top"
                        style={[modalStyles.input, modalStyles.textArea]}
                      />
                    </View>

                    <View style={modalStyles.modalActions}>
                      <TouchableOpacity
                        style={[
                          modalStyles.saveButton,
                          (!editTitle.trim() ||
                            !editMessageText.trim() ||
                            updateMessageMutation.isPending) &&
                            modalStyles.saveButtonDisabled,
                        ]}
                        onPress={handleSaveEdit}
                        disabled={
                          !editTitle.trim() ||
                          !editMessageText.trim() ||
                          updateMessageMutation.isPending
                        }
                      >
                        {updateMessageMutation.isPending ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={modalStyles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={modalStyles.cancelButton}
                        onPress={() => setEditMessageModalVisible(false)}
                        disabled={updateMessageMutation.isPending}
                      >
                        <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
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
              profileData && profilePicUpdatedAt
                ? buildCachedImageUrl(profileData?.id, profilePicUpdatedAt)
                : null
            }
            onClose={() => setShowPictureViewer(false)}
          />

          <StoreMessageModal
            visible={storeMessageModalVisible}
            onClose={() => setStoreMessageModalVisible(false)}
            onStore={handleStoreMessage}
            loading={storingMessage}
          />

          <ViewMessageModal
            visible={viewMessageModalVisible}
            onClose={() => setViewMessageModalVisible(false)}
            message={selectedMessage}
            type="stored"
          />

          <ConfirmationModal
            visible={confirmationVisible}
            message={confirmationMessage}
            onConfirm={() => {
              if (confirmationMessage.includes("What would you like to do")) {
                handleEditMessage();
              } else {
                confirmationAction?.();
              }
            }}
            onCancel={() => {
              if (confirmationMessage.includes("What would you like to do")) {
                handleDeleteMessage();
              } else {
                setConfirmationVisible(false);
              }
            }}
            onClose={() => setConfirmationVisible(false)}
            confirmText={
              confirmationMessage.includes("What would you like to do")
                ? "Edit"
                : "Confirm"
            }
            cancelText={
              confirmationMessage.includes("What would you like to do")
                ? "Delete"
                : "Cancel"
            }
            loading={deleteMessageMutation.isPending}
          />

          <AlertModal
            visible={alertVisible}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      </ScrollView>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}

      {uploading && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Uploading your profile picture</Text>
        </View>
      )}

      {showSuccess && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{success}</Text>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;

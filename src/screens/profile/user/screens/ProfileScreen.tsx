// external
import React, { useState, useEffect, useMemo } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StackScreenProps } from "@react-navigation/stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import UpdateFavoritesModal from "../../../../components/modals/input/UpdateFavoritesModal";
import { updateUserFavorites } from "../../../../services/api/profiles/favoritesService";
import { updateLoveLanguage } from "../../../../services/api/profiles/loveLanguageService";
import { updateAboutUser } from "../../../../services/api/profiles/aboutUserService";
import { buildCachedImageUrl } from "../../../../utils/cache/imageCacheUtils";
import { FavoritesType } from "../../../../types/Favorites";
import { favoritesObjectToArray } from "../../../../helpers/profileHelpers";
import {
  storeMessage,
  updateMessage,
  deleteMessage,
} from "../../../../services/api/profiles/messageStorageService";
import { useAuth } from "../../../../contexts/AuthContext";
import { updateProfilePicture } from "../../../../services/api/profiles/profileService";
import { updateProfileField } from "../../../../services/api/profiles/profileService";
import { useTheme } from "../../../../theme/ThemeContext";
import { createModalStyles } from "../styles/ModalStyles.styles";
import { createProfileStyles } from "../styles/ProfileScrees.styles";

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
import MessageStorage from "../components/MessageStorage";
import StoreMessageModal from "../../../../components/modals/input/StoreMessageModal";
import AlertModal from "../../../../components/modals/output/AlertModal";
import ConfirmationModal from "../../../../components/modals/selection/ConfirmationModal";
import ViewMessageModal from "../../../../components/modals/output/ViewMessageModal";
import ProfileImage from "../../../../components/common/ProfileImage";
import Shimmer from "../../../../components/skeletons/Shimmer";
import ErrorState from "../../../../components/common/ErrorState";

// hooks
import useToken from "../../../../hooks/useToken";
import { useProfilePicture } from "../../../../hooks/useProfilePicture";
import { useProfileSelector } from "../../../../hooks/useProfileSelector";
import { useProfile } from "../../../../hooks/useProfile";
import { useRequestsCount } from "../../../../hooks/useRequests";

// types
type ProfileScreenProps = StackScreenProps<any, any>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // hook variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);
  const modalStyles = useMemo(() => createModalStyles(theme), [theme]);

  // variables
  const HEADER_HEIGHT = 60;

  // use states
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarFetched, setAvatarFetched] = useState(false);

  // use states (processing)
  const [loadingName, setLoadingName] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingBio, setLoadingBio] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const [alertTitle, setAlertTitle] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
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

  // fetch profile data
  const {
    data: _profileData,
    isLoading: profileLoading,
    refetch: refetchProfileData,
    isError: profileError,
  } = useProfile(token, user?.id);
  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchProfilePicture,
  } = useProfilePicture(user?.id, token);

  // fetch request count
  const { requestsCount, refetch: refetchRequests } = useRequestsCount(token);

  // select data from profile selector
  const userData =
    useProfileSelector(user?.id, (state) => state?.loveLanguage) || null;
  const specialDates =
    useProfileSelector(user?.id, (state) => state?.specialDates) || [];
  const loveLanguage =
    useProfileSelector(user?.id, (state) => state?.loveLanguage) || null;
  const status =
    useProfileSelector(user?.id, (state) => state?.userStatus) || null;
  const favorites =
    useProfileSelector(user?.id, (state) => state?.userFavorites) || {};
  const userMood =
    useProfileSelector(user?.id, (state) => state?.userMood) || null;
  const aboutUser =
    useProfileSelector(user?.id, (state) => state?.aboutUser) || null;
  const storedMessages =
    useProfileSelector(user?.id, (state) => state?.storedMessage) || null;

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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (user?.id && token) {
      Promise.resolve(fetchProfilePicture()).finally(() =>
        setAvatarFetched(true)
      );
    }
  }, [user?.id, token]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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
      if (!token) {
        setAlertTitle("Update Failed");
        setAlertMessage(
          "It appears that your session has expired. Try to log in again and retry."
        );
        setShowErrorAlert(true);
        return;
      }
      return await updateMessage(token, messageId, title, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });

      setEditMessageModalVisible(false);
      setEditingMessage(null);
      setEditTitle("");
      setEditMessageText("");
      setAlertTitle("Message Updated");
      setAlertMessage("You have updated the message.");
      setShowSuccessAlert(true);
    },
    onError: (error: any) => {
      setAlertTitle("Failed");
      setAlertMessage(
        error.response?.data?.error || "Failed to update message."
      );
      setShowErrorAlert(true);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!token) {
        setAlertTitle("Delete Failed");
        setAlertMessage(
          "It appears that your session has expired. Try to log in again and retry."
        );
        setShowErrorAlert(true);
        return;
      }
      return await deleteMessage(token, messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });

      setConfirmationVisible(false);
      setAlertTitle("Message Deleted");
      setAlertMessage("You have deleted the message.");
      setShowSuccessAlert(true);
    },
    onError: (error: any) => {
      setAlertTitle("Failed");
      setAlertMessage(
        error.response?.data?.error || "Failed to delete message."
      );
      setShowErrorAlert(true);
    },
  });

  // handlers
  const handleSaveLoveLanguage = async (newLoveLanguage: string) => {
    setSaving(true);
    try {
      if (!token) {
        setLoveLanguageModalVisible(false);
        setError("Session expired. Log in again and try again.");
        return;
      }

      await updateLoveLanguage(token, newLoveLanguage);
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
      setLoveLanguageModalVisible(false);
      setSuccess("You have updated your love language");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save love language");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async (newAbout: string) => {
    setSaving(true);
    try {
      if (!token) {
        setAboutModalVisible(false);
        setError("Session expired. Log in again and try again.");
        return;
      }

      await updateAboutUser(token, newAbout);
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });

      setAboutModalVisible(false);
      setSuccess("You have updated more details about you");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save about");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPress = () => {
    setShowPictureModal(true);
  };

  const handleSaveFavorites = async (newFavorites: FavoritesType) => {
    setSaving(true);
    try {
      if (!token) {
        setFavoritesModalVisible(false);
        setError("Session expired. Log in again and retry.");
        return;
      }

      await updateUserFavorites(token, newFavorites);
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });

      setFavoritesModalVisible(false);
      setSuccess("You have updated your favorites");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save favorites");
    } finally {
      setSaving(false);
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
        if (!token) {
          setError("Session expired. Log in again and retry.");
          return;
        }
        if (result.assets[0].base64.length > 10 * 1024 * 1024) {
          setError("Image is too large. Make sure it's less than 10 MB.");
          return;
        }

        setUploading(true);

        const mimeType = result.assets[0].mimeType || "image/jpeg";
        const base64String = `data:${mimeType};base64,${result.assets[0].base64}`;

        await updateProfilePicture(token, base64String);
        setSuccess("Profile picture uploaded");
        await fetchProfilePicture();
      } catch (err: any) {
        if (
          err.response?.data?.error?.includes("PayloadTooLarge") ||
          err.message?.includes("PayloadTooLarge")
        ) {
          setError("Image is too large. Make sure is less than 10 MB.");
        } else {
          setError(
            err.response?.data?.error || "Failed to upload profile picture"
          );
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

      if (!token) {
        setAlertTitle("Action Failed");
        setAlertMessage(
          "Couldn't update your " +
            field +
            ". Your session may have expired. Log in again."
        );
        setShowErrorAlert(true);
        return;
      }

      await updateProfileField(field, value, token);
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
    } catch (err: any) {
      setError(err.response.data.error || `Failed to update ${field}`);
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
      if (!token) {
        setAlertTitle("Failed to Store");
        setAlertMessage(
          "It appears that your session has expired. Try to log in again and retry."
        );
        setShowErrorAlert(true);
        return;
      }
      await storeMessage(token, title, message);

      setAlertTitle("Message Stored");
      setAlertMessage("You have stored a message.");
      setStoreMessageModalVisible(false);
      setShowSuccessAlert(true);
    } catch (error: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        error.response?.data?.error || "Failed to store message."
      );
      setStoreMessageModalVisible(false);
      setShowErrorAlert(true);
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
    if (!selectedMessage) {
      return;
    }

    setEditingMessage(selectedMessage);
    setEditTitle(selectedMessage.title);
    setEditMessageText(selectedMessage.message);
    setEditMessageModalVisible(true);
    setConfirmationVisible(false);
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage) {
      return;
    }

    setConfirmationMessage("Are you sure you want to delete this message?");
    setConfirmationAction(
      () => () => deleteMessageMutation.mutate(selectedMessage.id)
    );
    setConfirmationVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !editTitle.trim() || !editMessageText.trim()) {
      setAlertTitle("Missing Fields");
      setAlertMessage("Please fill in all fields");
      setShowErrorAlert(true);
      return;
    }

    updateMessageMutation.mutate({
      messageId: editingMessage.id,
      title: editTitle.trim(),
      message: editMessageText.trim(),
    });
  };

  // fiels for editing
  const originalName = userData?.name || "";
  const originalUsername = userData?.username || "";
  const originalBio = userData?.bio || "";

  if (!userData && !profileLoading) {
    return (
      <ErrorState
        message="Ran into some trouble showing you your profile. Try again?"
        onRetry={() => refetchProfileData()}
      />
    );
  }

  if (profileError) {
    return (
      <ErrorState
        message="Ran into some trouble showing you your profile. Try again?"
        onRetry={() => refetchProfileData()}
      />
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
      <View
        style={{
          backgroundColor: theme.colors.background,
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
            color: theme.colors.text,
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
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("PendingRequests")}
        >
          <Feather name="users" size={22} color={theme.colors.text} />
          {requestsCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: theme.colors.primary,
                borderRadius: 10,
                paddingHorizontal: 5,
                paddingVertical: 1,
                minWidth: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {requestsCount > 99 ? "99+" : requestsCount}
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
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="settings" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {profileLoading ? (
          <View style={styles.profileRow}>
            <Shimmer radius={8} height={120} style={{ width: "100%" }} />
          </View>
        ) : (
          <>
            <View style={styles.profileRow}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={handleAvatarPress}
              >
                <ProfileImage
                  avatarUri={avatarUri}
                  avatarFetched={avatarFetched}
                  updatedAt={profilePicUpdatedAt}
                  style={styles.avatar}
                  userId={user?.id}
                />
              </TouchableOpacity>
              <View style={styles.infoWrapper}>
                <Text style={styles.name}>{userData?.name || ""}</Text>
                <Text style={styles.username}>@{userData?.username || ""}</Text>
                <Text style={styles.bio}>{userData?.bio || ""}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditName(userData?.name || "");
                  setEditUsername(userData?.username || "");
                  setEditBio(userData?.bio || "");
                  setEditModalVisible(true);
                }}
              >
                <Feather name="edit-2" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.divider} />

        {profileLoading ? (
          <View style={styles.partnerRow}>
            <Shimmer radius={8} height={20} style={{ width: "100%" }} />
          </View>
        ) : (
          <View style={styles.partnerRow}>
            <Text style={styles.partnerText}>
              Partner:{" "}
              <Text
                style={
                  userData?.partnerName &&
                  userData?.partnerName !== "No partner"
                    ? styles.partnerName
                    : styles.noPartnerName
                }
              >
                {userData?.name || "No partner"}
              </Text>
            </Text>
          </View>
        )}

        {profileLoading ? (
          <Shimmer
            radius={8}
            height={80}
            style={{ width: "100%", marginBottom: 14 }}
          />
        ) : (
          <StatusMood
            status={homeStatus}
            statusDescription={statusDescription}
            mood={userMood?.mood || "No mood set"}
            moodDescription={userMood?.description}
            onEdit={() => refetchProfileData()}
            onAddHome={() => {
              refetchProfileData();
            }}
          />
        )}

        <Anniversary
          specialDates={specialDates}
          specialDatesLoading={profileLoading}
          onEditAnniversary={() => {}}
          onEditDayMet={() => {}}
        />

        {profileLoading ? (
          <Shimmer radius={8} height={150} style={{ width: "100%" }} />
        ) : (
          <Favorites
            favorites={favoritesObjectToArray(favorites)}
            onEdit={() => setFavoritesModalVisible(true)}
          />
        )}

        <View style={styles.divider} />

        {profileLoading ? (
          <Shimmer
            radius={8}
            height={40}
            style={{ width: "100%", marginBottom: 18 }}
          />
        ) : (
          <LoveLanguage
            loveLanguage={loveLanguage.loveLanguage}
            onEdit={() => setLoveLanguageModalVisible(true)}
          />
        )}

        {profileLoading ? (
          <Shimmer
            radius={8}
            height={40}
            style={{ width: "100%", marginBottom: 18 }}
          />
        ) : (
          <MoreAboutYou
            about={aboutUser.about}
            onEdit={() => setAboutModalVisible(true)}
          />
        )}

        {profileLoading ? (
          <Shimmer
            radius={8}
            height={60}
            style={{ width: "100%", marginBottom: 60 }}
          />
        ) : (
          <MessageStorage
            name={userData?.partnerName || "No one"}
            messages={storedMessages}
            onAdd={handleAddMessage}
            onLongPress={handleLongPressMessage}
            onPress={handleViewMessage}
          />
        )}

        <View style={{ zIndex: 1000 }}>
          <UpdateFavoritesModal
            visible={favoritesModalVisible}
            loading={saving}
            initialFavorites={favorites}
            onClose={() => setFavoritesModalVisible(false)}
            onSave={handleSaveFavorites}
          />

          <UpdateLoveLanguageModal
            visible={loveLanguageModalVisible}
            loading={saving}
            initialLoveLanguage={loveLanguage}
            onClose={() => setLoveLanguageModalVisible(false)}
            onSave={handleSaveLoveLanguage}
          />

          <UpdateAboutModal
            visible={aboutModalVisible}
            loading={saving}
            initialAbout={aboutUser.about}
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
                        placeholderTextColor={theme.colors.muted}
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
                        placeholderTextColor={theme.colors.muted}
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
                        placeholderTextColor={theme.colors.muted}
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
                        <Feather name="x" size={24} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>

                    <View style={modalStyles.form}>
                      <Text style={modalStyles.label}>Message title</Text>
                      <TextInput
                        style={modalStyles.input}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Message title..."
                        placeholderTextColor={theme.colors.muted}
                        maxLength={50}
                      />

                      <Text style={modalStyles.label}>Message</Text>
                      <TextInput
                        value={editMessageText}
                        onChangeText={setEditMessageText}
                        placeholder="Type the message here..."
                        placeholderTextColor={theme.colors.muted}
                        multiline
                        maxLength={5000}
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
                          <ActivityIndicator
                            color={theme.colors.text}
                            size="small"
                          />
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
              user && profilePicUpdatedAt
                ? buildCachedImageUrl(
                    user?.id.toString(),
                    Math.floor(new Date(profilePicUpdatedAt).getTime() / 1000)
                  )
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
            visible={showSuccessAlert}
            type="success"
            title={alertTitle}
            message={alertMessage}
            buttonText="Great"
            onClose={() => setShowSuccessAlert(false)}
          />

          <AlertModal
            visible={showErrorAlert}
            type="error"
            title={alertTitle}
            message={alertMessage}
            buttonText="Close"
            onClose={() => setShowErrorAlert(false)}
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

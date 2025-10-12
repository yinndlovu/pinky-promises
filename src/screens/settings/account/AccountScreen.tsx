// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ToastAndroid,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";

// internal
import { deleteAccount } from "../../../services/api/account/accountService";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";

// content
import DeleteAccountModal from "../../../components/modals/input/DeleteAccountModal";
import { verifyPassword } from "../../../services/api/auth/authService";

type AccountScreenProps = StackScreenProps<any, any>;

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  // use states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // variables
  const { logout } = useAuth();
  const token = useToken();

  // handlers
  const handleDeleteAccountPress = () => {
    setDeleteModalVisible(true);
  };

  const handleVerifyPassword = async (password: string) => {
    setLoading(true);
    try {
      await verifyPassword(token, password);
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount(token);
      setDeleteModalVisible(false);

      if (Platform.OS === "android") {
        ToastAndroid.show("Account deleted successfully", ToastAndroid.SHORT);
      }

      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
    }
  };

  // use effects
  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Action</Text>
          <Pressable
            style={styles.actionRow}
            onPress={handleDeleteAccountPress}
            android_ripple={{ color: "#23243a" }}
          >
            <Text style={styles.actionText}>Delete your account</Text>
            <Ionicons name="chevron-forward" size={22} color="#ccc" />
          </Pressable>
          <Pressable
            style={styles.actionRow}
            onPress={() => navigation.navigate("ChangePassword")}
            android_ripple={{ color: "#23243a" }}
          >
            <Text style={styles.actionText}>Change password</Text>
            <Ionicons name="chevron-forward" size={22} color="#ccc" />
          </Pressable>
        </View>
      </ScrollView>
      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={handleDeleteAccount}
        onVerifyPassword={handleVerifyPassword}
        loading={loading}
      />

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 6,
  },
  actionRow: {
    backgroundColor: "#2e2f4a",
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    bottom: 10,
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

export default AccountScreen;

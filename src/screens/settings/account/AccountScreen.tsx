// external
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";

type AccountScreenProps = StackScreenProps<any, any>;

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  // handlers
  const handleDeleteAccountPress = () => {
  };

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
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
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

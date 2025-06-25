import React, { useLayoutEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

const dummyUser = {
  name: "Jane Doe",
  username: "janedoe123",
  bio: "Lover of pinky promises and surprises. 🎁",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
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
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: dummyUser.avatar }} style={styles.avatar} />
          </View>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{dummyUser.name}</Text>
            <Text style={styles.username}>@{dummyUser.username}</Text>
            <Text style={styles.bio}>{dummyUser.bio}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 80,
    width: "100%",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    alignSelf: "flex-start",
    marginBottom: 16,
    marginRight: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
});

export default HomeScreen;

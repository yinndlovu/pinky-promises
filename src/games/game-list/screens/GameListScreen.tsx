// external
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

// internal
import { GAMES, Game } from "../../interfaces/Game";

// content
import RequestGameModal from "../../components/modals/RequestGameModal";

const GameListScreen = ({ navigation }: any) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleRequestGame = () => {
    console.log("Request sent for", selectedGame?.name);

    navigation.navigate("GameWaitingScreen", {
      gameName: selectedGame?.name,
      yourInfo: { name: "Yin", avatarUrl: "https://example.com/avatar.png" },
      partnerInfo: null,
    });

    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {GAMES.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => handleSelectGame(game)}
            android_ripple={{ color: "#23243a" }}
            style={({ pressed }) => [
              styles.gameItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <FontAwesome6
              name={game.icon || "gamepad"}
              size={24}
              color="#e03487"
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.gameName}>{game.name}</Text>
              {game.description && (
                <Text style={styles.gameDescription}>{game.description}</Text>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <RequestGameModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onRequestGame={handleRequestGame}
        gameName={selectedGame?.name || ""}
      />
    </View>
  );
};

export default GameListScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  gameItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2b44",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  gameName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameDescription: {
    color: "#b0b3c6",
    fontSize: 14,
    marginTop: 4,
  },
});

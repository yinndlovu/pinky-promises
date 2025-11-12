// external
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { v4 as uuidv4 } from "uuid";

// internal
import { GAMES, Game } from "../../interfaces/Game";
import { fetchCurrentUserProfileAndAvatar } from "../../helpers/userDetailsHelper";
import { fetchPartnerProfileAndAvatar } from "../../helpers/partnerDetailsHelper";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../theme/ThemeContext";

// content
import RequestGameModal from "../../components/modals/RequestGameModal";

const GameListScreen = ({ navigation }: any) => {
  // variables
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // handlers
  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleRequestGame = async () => {
    /*try {
      setIsRequesting(true);

      const userInfo = await fetchCurrentUserProfileAndAvatar();
      const partnerInfo = await fetchPartnerProfileAndAvatar();
      const roomId = uuidv4();

      let socket = getTriviaSocket();

      if (!socket) {
        socket = connectTriviaSocket();
      }

      if (socket && user?.id) {
        navigation.navigate("GameSetupScreen", {
          roomId,
          players: [userInfo, partnerInfo],
          gameName: selectedGame?.name,
          host: user.name,
        });
      } else {
        throw new Error("Socket or user not available");
      }

      setModalVisible(false);
    } catch (err) {
      console.error("Error preparing game:", err);
    } finally {
      setIsRequesting(false);
    }*/
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
              color={theme.colors.accent}
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
        isRequesting={isRequesting}
        onClose={() => setModalVisible(false)}
        onRequestGame={handleRequestGame}
        gameName={selectedGame?.name || ""}
      />
    </View>
  );
};

export default GameListScreen;

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      padding: 16,
    },
    gameItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
    },
    gameName: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    gameDescription: {
      color: theme.colors.muted,
      fontSize: 14,
      marginTop: 4,
    },
  });

// external
import { TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { PresentsStackParamList } from "../../types/StackParamList";

// screens
import GiftsScreen from "../../screens/gifts/screens/GiftsScreen";
import GameListScreen from "../../games/game-list/screens/GameListScreen";
import CartScreen from "../../screens/gifts/screens/CartScreen";

const PresentsStack = createStackNavigator<PresentsStackParamList>();

export default function PresentsStackScreen() {
  return (
    <PresentsStack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerShown: false,
        cardStyle: { backgroundColor: "#23243a" },
      }}
    >
      <PresentsStack.Screen name="PresentsScreen" component={GiftsScreen} />
      <PresentsStack.Screen
        name="GameListScreen"
        component={GameListScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Games",
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.setParams({ showOptions: true } as any)}
              style={{ marginRight: 16 }}
            >
              <FontAwesome6 name="chart-simple" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <PresentsStack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          headerShown: true,
          title: "Cart",
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
    </PresentsStack.Navigator>
  );
}

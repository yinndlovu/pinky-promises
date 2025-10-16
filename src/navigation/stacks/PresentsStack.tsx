// external
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { PresentsStackParamList } from "../../types/StackParamList";

// screens
import GiftsScreen from "../../screens/gifts/screens/GiftsScreen";
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

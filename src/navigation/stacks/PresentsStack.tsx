// external
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { PresentsStackParamList } from "../../types/StackParamList";
import { useTheme } from "../../theme/ThemeContext";

// screens
import GiftsScreen from "../../screens/gifts/screens/GiftsScreen";
import CartScreen from "../../screens/gifts/screens/CartScreen";

const PresentsStack = createStackNavigator<PresentsStackParamList>();

export default function PresentsStackScreen() {
  const { theme } = useTheme();

  return (
    <PresentsStack.Navigator
      screenOptions={{
        ...TransitionPresets.ScaleFromCenterAndroid,
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <PresentsStack.Screen name="PresentsScreen" component={GiftsScreen} />
      <PresentsStack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          headerShown: true,
          title: "Cart",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
    </PresentsStack.Navigator>
  );
}

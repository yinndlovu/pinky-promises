// external
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { HomeStackParamList } from "../../types/StackParamList";
import { useTheme } from "../../theme/ThemeContext";

// screens
import HomeScreen from "../../screens/home/screens/HomeScreen";
import SearchScreen from "../../screens/search/SearchScreen";
import PartnerProfileScreen from "../../screens/profile/partner/screens/PartnerProfileScreen";
import UserProfileScreen from "../../screens/profile/other/screens/UserProfileScreen";
import PortalScreen from "../../screens/portal/screens/PortalScreen";
import SentMessagesScreen from "../../screens/portal/screens/SentMessagesScreen";
import ReceivedMessagesScreen from "../../screens/portal/screens/ReceivedMessagesScreen";
import StreakScreen from "../../screens/streak/StreakScreen";
import GiftsScreen from "../../screens/gifts/screens/GiftsScreen";
import CartScreen from "../../screens/gifts/screens/CartScreen";

const HomeStack = createStackNavigator<HomeStackParamList>();

export default function HomeStackScreen() {
  const { theme } = useTheme();

  return (
    <HomeStack.Navigator
      screenOptions={{
        ...TransitionPresets.ScaleFromCenterAndroid,
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: true,
          title: "Search",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="PartnerProfile"
        component={PartnerProfileScreen}
        options={{
          headerShown: true,
          title: "Partner",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          headerShown: true,
          title: "",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <HomeStack.Screen
        name="PortalScreen"
        component={PortalScreen}
        options={{
          headerShown: true,
          title: "Portal",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="SentMessagesScreen"
        component={SentMessagesScreen}
        options={{
          headerShown: true,
          title: "Sent sweet messages",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="ReceivedMessagesScreen"
        component={ReceivedMessagesScreen}
        options={{
          headerShown: true,
          title: "Received sweet messages",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <HomeStack.Screen
        name="StreakScreen"
        component={StreakScreen}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="PresentsScreen"
        component={GiftsScreen}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
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
    </HomeStack.Navigator>
  );
}

// external
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { HomeStackParamList } from "../../types/StackParamList";

// screens
import HomeScreen from "../../screens/home/screens/HomeScreen";
import SearchScreen from "../../screens/search/SearchScreen";
import PartnerProfileScreen from "../../screens/profile/partner/screens/PartnerProfileScreen";
import UserProfileScreen from "../../screens/profile/other/screens/UserProfileScreen";
import PortalScreen from "../../screens/portal/screens/PortalScreen";
import SentMessagesScreen from "../../screens/portal/screens/SentMessagesScreen";
import ReceivedMessagesScreen from "../../screens/portal/screens/ReceivedMessagesScreen";

const HomeStack = createStackNavigator<HomeStackParamList>();

export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerShown: false,
        cardStyle: { backgroundColor: "#23243a" },
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: true,
          title: "Search",
          headerTintColor: "#fff",
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
          headerTintColor: "#fff",
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
          headerTintColor: "#fff",
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
          headerTintColor: "#fff",
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
          headerTintColor: "#fff",
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
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
    </HomeStack.Navigator>
  );
}

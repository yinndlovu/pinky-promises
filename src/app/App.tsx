// external
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Image } from "expo-image";
import Feather from "@expo/vector-icons/build/Feather";
import { FontAwesome6 } from "@expo/vector-icons";
import "react-native-get-random-values";

// internal
import { registerForPushNotificationsAsync } from "../utils/notifications/notifications";
import { NotificationProvider } from "../contexts/NotificationContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { sqlitePersistor } from "../database/reactQueryPersistor";
import { SSEProvider } from "../contexts/SSEContext";
import { navigationRef } from "../utils/navigation/navigation";
import { InviteProvider } from "../games/context/InviteContext";
import { checkBatteryStatus } from "../helpers/checkBatteryStatus";
import { RootStackParamList } from "../types/RootStackParamList";
import { useVersionCheck } from "../hooks/useVersionCheck";

// content
import PartnerProfileScreen from "../screens/profile/partner/screens/PartnerProfileScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import PortalScreen from "../screens/portal/screens/PortalScreen";
import SearchScreen from "../screens/search/SearchScreen";
import UserProfileScreen from "../screens/profile/other/screens/UserProfileScreen";
import PendingRequestsScreen from "../screens/requests/screens/PendingRequestsScreen";
import NotesScreen from "../screens/ours/screens/NotesScreen";
import WelcomeScreen from "../screens/welcome/WelcomeScreen";
import NameScreen from "../screens/auth/register/NameScreen";
import UsernameScreen from "../screens/auth/register/UsernameScreen";
import PasswordScreen from "../screens/auth/register/PasswordScreen";
import HomeScreen from "../screens/home/screens/HomeScreen";
import LoginScreen from "../screens/auth/login/LoginScreen";
import NavigationBar from "../layouts/NavigationBar";
import SettingsScreen from "../screens/settings/screens/SettingsScreen";
import ProfileScreen from "../screens/profile/user/screens/ProfileScreen";
import OursScreen from "../screens/ours/screens/OursScreen";
import GiftsScreen from "../screens/gifts/screens/GiftsScreen";
import ChangeEmailScreen from "../screens/settings/screens/ChangeEmailScreen";
import VerifyEmailOtpScreen from "../screens/settings/screens/VerifyEmailOtpScreen";
import ChangePasswordScreen from "../screens/settings/password/ChangePasswordScreen";
import NotificationsScreen from "../screens/settings/notifications/NotificationsScreen";
import TimelineScreen from "../screens/ours/screens/TimelineScreen";
import AboutScreen from "../screens/settings/about/AboutScreen";
import AllFavoriteMemoriesScreen from "../screens/ours/screens/AllFavoriteMemoriesScreen";
import SentMessagesScreen from "../screens/portal/screens/SentMessagesScreen";
import ReceivedMessagesScreen from "../screens/portal/screens/ReceivedMessagesScreen";
import CartScreen from "../screens/gifts/screens/CartScreen";
import AccountScreen from "../screens/settings/account/AccountScreen";
import GameListScreen from "../games/game-list/screens/GameListScreen";
import GameWaitingScreen from "../games/room/GameWaitingScreen";
import GameSetupScreen from "../games/trivia/screens/GameSetupScreen";
import GameSessionScreen from "../games/trivia/screens/GameSessionScreen";
import LoadingAnimation from "../components/loading/LoadingAnimation";
import VersionUpdateBanner from "../components/banners/VersionUpdateBanner";

// variables
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// navigation bar
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={({ navigation, state }) => (
        <NavigationBar
          navigation={navigation}
          currentRoute={state.routeNames[state.index]}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Presents" component={GiftsScreen} />
      <Tab.Screen name="Ours" component={OursScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AIHeader() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={require("../assets/ai_icon.png")}
        style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }}
      />
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
        Lily
      </Text>
    </View>
  );
}

// screens
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { versionInfo, showBanner, dismissBanner } = useVersionCheck();

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync();
      checkBatteryStatus();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <LoadingAnimation visible={isLoading} onClose={() => {}} size="large" />
      </View>
    );
  }

  return (
    <>
      {showBanner && versionInfo && (
        <VersionUpdateBanner
          versionInfo={versionInfo}
          onDismiss={dismissBanner}
        />
      )}
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Main" : "Welcome"}
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          headerShown: false,
          cardStyle: { backgroundColor: "#23243a" },
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 400 },
            },
            close: {
              animation: "timing",
              config: { duration: 400 },
            },
          },
        }}
      >
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: "Settings",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Name"
          component={NameScreen}
          options={{
            headerShown: true,
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Username"
          component={UsernameScreen}
          options={{
            headerShown: true,
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Password"
          component={PasswordScreen}
          options={{
            headerShown: true,
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: true,
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangeEmail"
          component={ChangeEmailScreen}
          options={{
            headerShown: true,
            title: "Change email address",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="VerifyEmailOTP"
          component={VerifyEmailOtpScreen}
          options={{
            headerShown: true,
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            headerShown: true,
            title: "Change password",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
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
        <Stack.Screen
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
        <Stack.Screen
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
        <Stack.Screen
          name="PendingRequests"
          component={PendingRequestsScreen}
          options={{
            headerShown: true,
            title: "Partner requests",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="NotesScreen"
          component={NotesScreen}
          options={{
            headerShown: true,
            title: "",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: () => <AIHeader />,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.setParams({ showOptions: true } as any)
                }
                style={{ marginRight: 16 }}
              >
                <Feather name="more-vertical" size={22} color="#fff" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
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
        <Stack.Screen
          name="NotificationsScreen"
          component={NotificationsScreen}
          options={{
            headerShown: true,
            title: "Notifications",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="TimelineScreen"
          component={TimelineScreen}
          options={{
            headerShown: true,
            title: "Timeline",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="AboutScreen"
          component={AboutScreen}
          options={{
            headerShown: true,
            title: "About",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="AllFavoriteMemoriesScreen"
          component={AllFavoriteMemoriesScreen}
          options={{
            headerShown: true,
            title: "All favorite memories",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
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
        <Stack.Screen
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
        <Stack.Screen
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
        <Stack.Screen
          name="AccountScreen"
          component={AccountScreen}
          options={{
            headerShown: true,
            title: "Account",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
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
                onPress={() =>
                  navigation.setParams({ showOptions: true } as any)
                }
                style={{ marginRight: 16 }}
              >
                <FontAwesome6 name="chart-simple" size={22} color="#fff" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="GameWaitingScreen"
          component={GameWaitingScreen as any}
          options={{
            headerShown: true,
            title: "Game Room",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="GameSetupScreen"
          component={GameSetupScreen}
          options={{
            headerShown: true,
            title: "Setup",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="GameSessionScreen"
          component={GameSessionScreen as any}
          options={{
            headerShown: true,
            title: "Playing Trivia",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: sqlitePersistor,
            maxAge: 1000 * 60 * 60 * 24 * 5,
          }}
          onSuccess={() => {}}
        >
          <SSEProvider>
            <NavigationContainer
              ref={navigationRef}
              theme={{
                dark: true,
                colors: {
                  primary: "#e03487",
                  background: "#23243a",
                  card: "#23243a",
                  text: "#fff",
                  border: "transparent",
                  notification: "#e03487",
                },
                fonts: {
                  regular: {
                    fontFamily: "System",
                    fontWeight: "400",
                  },
                  medium: {
                    fontFamily: "System",
                    fontWeight: "500",
                  },
                  bold: {
                    fontFamily: "System",
                    fontWeight: "700",
                  },
                  heavy: {
                    fontFamily: "System",
                    fontWeight: "900",
                  },
                },
              }}
            >
              <InviteProvider>
                <AppContent />
              </InviteProvider>
            </NavigationContainer>
          </SSEProvider>
        </PersistQueryClientProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#23243a",
  },
  tabText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});

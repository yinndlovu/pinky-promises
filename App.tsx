// external
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import React from "react";
import { useEffect } from "react";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Image } from "expo-image";

// internal
import { registerForPushNotificationsAsync } from "./src/utils/notifications";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { useNotification } from "./src/contexts/NotificationContext";
import { LOCATION_TASK_NAME } from "./src/background/LocationTask";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { sqlitePersistor } from "./src/database/reactQueryPersistor";

// content
import PartnerProfileScreen from "./src/screens/profile/partner/PartnerProfileScreen";
import ChatScreen from "./src/screens/chat/ChatScreen";
import PortalScreen from "./src/screens/portal/screens/PortalScreen";
import SearchScreen from "./src/screens/search/SearchScreen";
import UserProfileScreen from "./src/screens/profile/other/UserProfileScreen";
import PendingRequestsScreen from "./src/screens/requests/PendingRequestsScreen";
import NotesScreen from "./src/screens/ours/screens/NotesScreen";
import WelcomeScreen from "./src/screens/welcome/WelcomeScreen";
import NameScreen from "./src/screens/auth/register/NameScreen";
import UsernameScreen from "./src/screens/auth/register/UsernameScreen";
import PasswordScreen from "./src/screens/auth/register/PasswordScreen";
import HomeScreen from "./src/screens/home/HomeScreen";
import LoginScreen from "./src/screens/auth/login/LoginScreen";
import NavigationBar from "./src/components/navigation/NavigationBar";
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import ProfileScreen from "./src/screens/profile/user/ProfileScreen";
import OursScreen from "./src/screens/ours/screens/OursScreen";
import GiftsScreen from "./src/screens/gifts/GiftsScreen";
import ChangeEmailScreen from "./src/screens/settings/ChangeEmailScreen";
import VerifyEmailOtpScreen from "./src/screens/settings/VerifyEmailOtpScreen";
import ChangePasswordScreen from "./src/screens/settings/password/ChangePasswordScreen";
import NotificationsScreen from "./src/screens/settings/notifications/NotificationsScreen";
import TimelineScreen from "./src/screens/ours/screens/TimelineScreen";
import AboutScreen from "./src/screens/settings/about/AboutScreen";
import AllFavoriteMemoriesScreen from "./src/screens/ours/screens/AllFavoriteMemoriesScreen";
import LastSixSentScreen from "./src/screens/portal/screens/LastSixSentScreen";
import LastSixReceivedScreen from "./src/screens/portal/screens/LastSixReceivedScreen";
import Feather from "@expo/vector-icons/build/Feather";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

async function startBackgroundLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return;
  }

  const { status: bgStatus } =
    await Location.requestBackgroundPermissionsAsync();

  if (bgStatus !== "granted") {
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5 * 60 * 1000,
    distanceInterval: 30,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Location Service",
      notificationBody: "Tracking your home status...",
    },
  });
}

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
        source={require("./src/assets/ai_icon.png")}
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

  React.useEffect(() => {
    startBackgroundLocation();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
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
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Main" : "Welcome"}
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          headerShown: false,
          cardStyle: { backgroundColor: "#23243a" },
          transitionSpec: {
            open: { animation: "timing", config: { duration: 450 } },
            close: { animation: "timing", config: { duration: 450 } },
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
          name="LastSixSentScreen"
          component={LastSixSentScreen}
          options={{
            headerShown: true,
            title: "Last six sent",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="LastSixReceivedScreen"
          component={LastSixReceivedScreen}
          options={{
            headerShown: true,
            title: "Last six received",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });
  }, []);

  return (
    <NotificationProvider>
      <AuthProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: sqlitePersistor,
            maxAge: 1000 * 60 * 60 * 24 * 3,
          }}
          onSuccess={() => {}}
        >
          <AppContent />
        </PersistQueryClientProvider>
      </AuthProvider>
    </NotificationProvider>
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

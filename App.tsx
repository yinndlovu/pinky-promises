import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WelcomeScreen from "./screens/welcome/WelcomeScreen";
import NameScreen from "./screens/auth/register/NameScreen";
import UsernameScreen from "./screens/auth/register/UsernameScreen";
import PasswordScreen from "./screens/auth/register/PasswordScreen";
import HomeScreen from "./screens/home/HomeScreen";
import LoginScreen from "./screens/auth/login/LoginScreen";
import NavigationBar from "./components/navigation/NavigationBar";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import SettingsScreen from "./screens/settings/SettingsScreen";
import ProfileScreen from "./screens/profile/ProfileScreen";
import OursScreen from "./screens/ours/OursScreen";
import GiftsScreen from "./screens/gifts/GiftsScreen";
import ChangeEmailScreen from "./screens/settings/ChangeEmailScreen";
import VerifyEmailOtpScreen from "./screens/settings/VerifyEmailOtpScreen";
import ChangePasswordScreen from "./screens/settings/ChangePasswordScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PartnerProfileScreen from "./screens/profile/partner/PartnerProfileScreen";
import * as Location from "expo-location";
import { LOCATION_TASK_NAME } from "./background/LocationTask";
import React from "react";
import SearchScreen from "./screens/search/SearchScreen";
import UserProfileScreen from "./screens/profile/user/UserProfileScreen";
import PendingRequestsScreen from "./screens/requests/PendingRequestsScreen";
import NotesScreen from "./screens/ours/NotesScreen";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "./utils/notifications";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
    timeInterval: 30 * 60 * 1000,
    distanceInterval: 50,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Location Service",
      notificationBody: "Tracking your home status...",
    },
  });
}

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

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    startBackgroundLocation();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

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
            title: "",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
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
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
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
            title: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
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
            title: "",
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: "transparent" },
            headerShadowVisible: false,
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
            title: "",
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
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
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

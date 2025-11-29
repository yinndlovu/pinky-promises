// external
import {
  TransitionPresets,
  createStackNavigator,
} from "@react-navigation/stack";

// internal
import { ProfileStackParamList } from "../../types/StackParamList";
import { useTheme } from "../../theme/ThemeContext";

// screens
import ProfileScreen from "../../screens/profile/user/screens/ProfileScreen";
import SettingsScreen from "../../screens/settings/screens/SettingsScreen";
import ChangeEmailScreen from "../../screens/settings/screens/ChangeEmailScreen";
import VerifyEmailOtpScreen from "../../screens/settings/screens/VerifyEmailOtpScreen";
import ChangePasswordScreen from "../../screens/settings/password/ChangePasswordScreen";
import NotificationsScreen from "../../screens/settings/notifications/NotificationsScreen";
import AccountScreen from "../../screens/settings/account/AccountScreen";
import AboutScreen from "../../screens/settings/about/AboutScreen";
import PendingRequestsScreen from "../../screens/requests/screens/PendingRequestsScreen";

const ProfileStack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStackScreen() {
  const { theme } = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        ...TransitionPresets.ScaleFromCenterAndroid,
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: "Settings",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ProfileStack.Screen
        name="ChangeEmail"
        component={ChangeEmailScreen}
        options={{
          headerShown: true,
          title: "Change email address",
          headerTransparent: true,
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ProfileStack.Screen
        name="VerifyEmailOTP"
        component={VerifyEmailOtpScreen}
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          title: "Change password",
          headerTransparent: true,
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ProfileStack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: "Notifications",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ProfileStack.Screen
        name="PendingRequests"
        component={PendingRequestsScreen}
        options={{
          headerShown: true,
          title: "Partner requests",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ProfileStack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{
          headerShown: true,
          title: "Account",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <ProfileStack.Screen
        name="AboutScreen"
        component={AboutScreen}
        options={{
          headerShown: true,
          title: "About",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
    </ProfileStack.Navigator>
  );
}

// external
import { TouchableOpacity } from "react-native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import Feather from "@expo/vector-icons/build/Feather";

// internal
import { RootStackParamList } from "../types/StackParamList";
import { useAuth } from "../contexts/AuthContext";

// screens
import WelcomeScreen from "../screens/welcome/WelcomeScreen";
import NameScreen from "../screens/auth/register/NameScreen";
import PasswordScreen from "../screens/auth/register/PasswordScreen";
import UsernameScreen from "../screens/auth/register/UsernameScreen";
import ExistingUsernameScreen from "../screens/auth/reset-password/ExistingUsernameScreen";
import PinVerificationScreen from "../screens/auth/reset-password/PinVerificationScreen";
import NewPasswordScreen from "../screens/auth/reset-password/NewPasswordScreen";
import ResetSuccessScreen from "../screens/auth/reset-password/ResetSuccessScreen";
import LoginScreen from "../screens/auth/login/LoginScreen";
import MainTabs from "./MainTabs";
import ChatScreen from "../screens/chat/ChatScreen";
import GameWaitingScreen from "../games/room/GameWaitingScreen";
import GameSetupScreen from "../games/trivia/screens/GameSetupScreen";
import GameSessionScreen from "../games/trivia/screens/GameSessionScreen";

// components
import AIHeader from "./components/AIHeader";

const RootStack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // variables
  const { isAuthenticated } = useAuth();
  
  return (
    <RootStack.Navigator
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
      <RootStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
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
      <RootStack.Screen
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
      <RootStack.Screen
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
      <RootStack.Screen
        name="ExistingUsername"
        component={ExistingUsernameScreen}
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <RootStack.Screen
        name="PinVerification"
        component={PinVerificationScreen}
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <RootStack.Screen
        name="NewPassword"
        component={NewPasswordScreen}
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <RootStack.Screen
        name="ResetSuccess"
        component={ResetSuccessScreen}
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <RootStack.Screen
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
      <RootStack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
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
              onPress={() => navigation.setParams({ showOptions: true } as any)}
              style={{ marginRight: 16 }}
            >
              <Feather name="more-vertical" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <RootStack.Screen
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
      <RootStack.Screen
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
      <RootStack.Screen
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
    </RootStack.Navigator>
  );
}

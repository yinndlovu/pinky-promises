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
import { StyleSheet, View, Text } from "react-native";
import SettingsScreen from "./screens/settings/SettingsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function GiftsScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.tabText}>Gifts (dummy)</Text>
    </View>
  );
}
function FeedScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.tabText}>Feed (dummy)</Text>
    </View>
  );
}
function ProfileScreen() {
  return (
    <View style={styles.centered}>
      <Text style={styles.tabText}>Profile (dummy)</Text>
    </View>
  );
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
      <Tab.Screen name="Gifts" component={GiftsScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
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
        initialRouteName="Welcome"
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
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
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

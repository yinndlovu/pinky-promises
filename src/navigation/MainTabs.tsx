// external
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// layouts
import NavigationBar from "../layouts/NavigationBar";

// stack navigators
import HomeStackScreen from "./stacks/HomeStack";
import PresentsStackScreen from "./stacks/PresentsStack";
import OursStackScreen from "./stacks/OursStack";
import ProfileStackScreen from "./stacks/ProfileStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
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
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Presents" component={PresentsStackScreen} />
      <Tab.Screen name="Ours" component={OursStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

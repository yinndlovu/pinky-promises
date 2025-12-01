// external
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// layouts
import NavigationBar from "../layouts/NavigationBar";

// stack navigators
import HomeStackScreen from "./stacks/HomeStack";
import PeriodStackScreen from "./stacks/PeriodStack";
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
      <Tab.Screen name="Period" component={PeriodStackScreen} />
      <Tab.Screen name="Ours" component={OursStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

// external
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { OursStackParamList } from "../../types/StackParamList";
import { useTheme } from "../../theme/ThemeContext";

// screens
import OursScreen from "../../screens/ours/screens/OursScreen";
import NotesScreen from "../../screens/ours/screens/NotesScreen";
import TimelineScreen from "../../screens/ours/screens/TimelineScreen";
import AllFavoriteMemoriesScreen from "../../screens/ours/screens/AllFavoriteMemoriesScreen";

const OursStack = createStackNavigator<OursStackParamList>();

export default function OursStackScreen() {
  const { theme } = useTheme();

  return (
    <OursStack.Navigator
      screenOptions={{
        ...TransitionPresets.ScaleFromCenterAndroid,
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <OursStack.Screen name="OursScreen" component={OursScreen} />
      <OursStack.Screen
        name="NotesScreen"
        component={NotesScreen}
        options={{
          headerShown: true,
          title: "",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
        }}
      />
      <OursStack.Screen
        name="TimelineScreen"
        component={TimelineScreen}
        options={{
          headerShown: true,
          title: "Timeline",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <OursStack.Screen
        name="AllFavoriteMemoriesScreen"
        component={AllFavoriteMemoriesScreen}
        options={{
          headerShown: true,
          title: "All favorite memories",
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
    </OursStack.Navigator>
  );
}

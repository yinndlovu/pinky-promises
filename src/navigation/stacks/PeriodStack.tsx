// external
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

// internal
import { PeriodStackParamList } from "../../types/StackParamList";
import { useTheme } from "../../theme/ThemeContext";

// screens
import PeriodScreen from "../../screens/period/screens/PeriodScreen";

const PeriodStackNav = createStackNavigator<PeriodStackParamList>();

export default function PeriodStackScreen() {
  const { theme } = useTheme();

  return (
    <PeriodStackNav.Navigator
      screenOptions={{
        ...TransitionPresets.ScaleFromCenterAndroid,
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <PeriodStackNav.Screen name="PeriodScreen" component={PeriodScreen} />
    </PeriodStackNav.Navigator>
  );
}

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './pages/WelcomeScreen';
import NameScreen from './pages/auth/register/NameScreen';
import UsernameScreen from './pages/auth/register/UsernameScreen';
import PasswordScreen from './pages/auth/register/PasswordScreen';
import SuccessScreen from './pages/SuccessScreen';
import LoginScreen from './pages/auth/login/LoginScreen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Name" component={NameScreen}
          options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: '#fff' }} />
        <Stack.Screen name="Username" component={UsernameScreen}
          options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: '#fff' }} />
        <Stack.Screen name="Password" component={PasswordScreen}
          options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: '#fff' }} />
        <Stack.Screen name="Success" component={SuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen}
          options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: '#fff' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

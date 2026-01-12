// external
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useEffect, useMemo } from "react";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "react-native-get-random-values";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

// internal
import { registerForPushNotificationsAsync } from "../utils/notifications/notifications";
import { NotificationProvider } from "../contexts/NotificationContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { sqlitePersistor } from "../database/reactQueryPersistor";
import { SocketProvider } from "../contexts/SocketContext";
import { navigationRef } from "../utils/navigation/navigation";
import { checkBatteryStatus } from "../helpers/checkBatteryStatus";
import { useVersionCheck } from "../hooks/useVersionCheck";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";
import useToken from "../hooks/useToken";

// content
import LoadingAnimation from "../components/loading/LoadingAnimation";
import VersionUpdateBanner from "../components/banners/VersionUpdateBanner";
import RootNavigator from "../navigation/RootNavigator";
import MandatoryUpdateChecker from "../contexts/MandatoryUpdateChecker";

// variables
const queryClient = new QueryClient();

// screens
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const token = useToken();
  const { versionInfo, showBanner, dismissBanner } = useVersionCheck();
  const { theme } = useTheme();
  const styles = useMemo(() => createAppStyles(theme), [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync(token);
      checkBatteryStatus(token);
    }
  }, [isAuthenticated, token]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <LoadingAnimation visible={isLoading} onClose={() => {}} size="large" />
      </View>
    );
  }

  return (
    <>
      {showBanner && versionInfo && (
        <VersionUpdateBanner
          versionInfo={versionInfo}
          onDismiss={dismissBanner}
        />
      )}

      <RootNavigator />
    </>
  );
}

function AppNavigation() {
  const { theme } = useTheme();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync(theme.dark ? "light" : "dark");
  }, [theme]);

  return (
    <NavigationContainer ref={navigationRef} theme={useTheme().theme}>
      <AppContent />
      <StatusBar
        style={useTheme().theme.dark ? "light" : "dark"}
        backgroundColor={theme.colors.background}
      />
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
    <MandatoryUpdateChecker>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister: sqlitePersistor,
                maxAge: 1000 * 60 * 60 * 24 * 5,
              }}
              onSuccess={() => {}}
            >
              <SocketProvider>
                <ThemeProvider>
                  <AppNavigation />
                </ThemeProvider>
              </SocketProvider>
            </PersistQueryClientProvider>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </MandatoryUpdateChecker>
  );
}

const createAppStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    tabText: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "bold",
    },
  });

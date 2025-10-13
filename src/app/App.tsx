// external
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useEffect } from "react";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "react-native-get-random-values";
import { SafeAreaProvider } from "react-native-safe-area-context";

// internal
import { registerForPushNotificationsAsync } from "../utils/notifications/notifications";
import { NotificationProvider } from "../contexts/NotificationContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { sqlitePersistor } from "../database/reactQueryPersistor";
import { SSEProvider } from "../contexts/SSEContext";
import { navigationRef } from "../utils/navigation/navigation";
import { InviteProvider } from "../games/context/InviteContext";
import { checkBatteryStatus } from "../helpers/checkBatteryStatus";
import { useVersionCheck } from "../hooks/useVersionCheck";
import useToken from "../hooks/useToken";

// content
import LoadingAnimation from "../components/loading/LoadingAnimation";
import VersionUpdateBanner from "../components/banners/VersionUpdateBanner";
import RootNavigator from "../navigation/RootNavigator";

// variables

const queryClient = new QueryClient();

// screens
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const token = useToken();
  const { versionInfo, showBanner, dismissBanner } = useVersionCheck();

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync();
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

      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });
  }, []);

  return (
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
            <SSEProvider>
              <NavigationContainer
                ref={navigationRef}
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
                <InviteProvider>
                  <AppContent />
                </InviteProvider>
              </NavigationContainer>
            </SSEProvider>
          </PersistQueryClientProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
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

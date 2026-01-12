// external
import { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

// internal
import {
  getLatestVersion,
  shouldShowUpdate,
  AppVersionInfo,
} from "../services/api/app-version/appVersionService";
import { APP_VERSION } from "../configuration/config";
import MandatoryUpdateModal from "../components/modals/output/MandatoryUpdateModal";

interface MandatoryUpdateCheckerProps {
  children: React.ReactNode;
}

export default function MandatoryUpdateChecker({
  children,
}: MandatoryUpdateCheckerProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [mandatoryUpdate, setMandatoryUpdate] = useState<AppVersionInfo | null>(
    null
  );

  useEffect(() => {
    checkForMandatoryUpdate();
  }, []);

  const checkForMandatoryUpdate = async () => {
    try {
      setIsChecking(true);
      const latest = await getLatestVersion();

      // check if there's an update AND it's mandatory
      if (shouldShowUpdate(APP_VERSION, latest.version) && latest.mandatory) {
        setMandatoryUpdate(latest);
      }
    } catch (error) {
      console.log("Failed to check for mandatory update:", error);
      // on error, allow app to continue (don't block on network issues)
    } finally {
      setIsChecking(false);
    }
  };

  // show loading while checking
  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // if there's a mandatory update, show the modal and block everything
  if (mandatoryUpdate) {
    return (
      <>
        <MandatoryUpdateModal visible={true} versionInfo={mandatoryUpdate} />
      </>
    );
  }

  // no mandatory update, allow app to continue
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

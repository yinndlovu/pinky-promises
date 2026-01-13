// external
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

// internal
import {
  getLatestVersion,
  shouldShowUpdate,
  AppVersionInfo,
} from "../services/api/app-version/appVersionService";
import { APP_VERSION } from "../configuration/config";
import MandatoryUpdateModal from "../components/modals/output/MandatoryUpdateModal";

// animation
import catFootprints from "../assets/animations/cat-footprints.json";

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

      if (shouldShowUpdate(APP_VERSION, latest.version) && latest.mandatory) {
        setMandatoryUpdate(latest);
      }
    } catch (error) {
      console.log("Failed to check for mandatory update:", error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={catFootprints}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
    );
  }

  if (mandatoryUpdate) {
    return (
      <>
        <MandatoryUpdateModal visible={true} versionInfo={mandatoryUpdate} />
      </>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  animation: {
    width: 200,
    height: 200,
  },
});

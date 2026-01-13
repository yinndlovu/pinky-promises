// external
import { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// internal
import {
  getLatestVersion,
  shouldShowUpdate,
  AppVersionInfo,
} from "../services/api/app-version/appVersionService";
import { APP_VERSION } from "../configuration/config";
import MandatoryUpdateModal from "../components/modals/output/MandatoryUpdateModal";

SplashScreen.preventAutoHideAsync();

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
      await SplashScreen.hideAsync();
    }
  };

  if (isChecking) {
    return null;
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

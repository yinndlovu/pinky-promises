import { useState, useEffect } from "react";
import {
  getLatestVersion,
  shouldShowUpdate,
  AppVersionInfo,
} from "../services/api/app-version/appVersionService";
import { APP_VERSION } from "../configuration/config";

export function useVersionCheck() {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      setIsLoading(true);
      const latest = await getLatestVersion();

      if (shouldShowUpdate(APP_VERSION, latest.version)) {
        setVersionInfo(latest);
        setShowBanner(true);
      }
    } catch (error) {
      console.log("Failed to check for updates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  return {
    versionInfo,
    showBanner,
    isLoading,
    dismissBanner,
    checkForUpdates,
  };
}

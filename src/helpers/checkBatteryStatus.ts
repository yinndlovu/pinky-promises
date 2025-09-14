import { getBatteryLevelAsync } from "expo-battery";
import { updateBatteryStatus } from "../services/api/profiles/batteryStatusService";
import useToken from "../hooks/useToken";

export async function checkBatteryStatus() {
  try {
    const token = useToken();

    if (!token) {
      return;
    }
    
    const batteryLevel = await getBatteryLevelAsync();

    if (batteryLevel === null) {
      return;
    }

    const percent = Math.round(batteryLevel * 100);

    await updateBatteryStatus(token, percent);
  } catch (error) {}
}

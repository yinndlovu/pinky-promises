import { getBatteryLevelAsync } from "expo-battery";
import { updateBatteryStatus } from "../services/api/profiles/batteryStatusService";

export async function checkBatteryStatus(token: string | null) {
  try {
    const batteryLevel = await getBatteryLevelAsync();

    if (batteryLevel === null) {
      return;
    }

    const percent = Math.round(batteryLevel * 100);

    await updateBatteryStatus(token, percent);
  } catch (error) {}
}

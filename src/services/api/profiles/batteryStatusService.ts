import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateBatteryStatus(token: string, batteryLevel: number) {
  const response = await axios.put(
    `${BASE_URL}/battery-status/update`,
    { batteryLevel },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

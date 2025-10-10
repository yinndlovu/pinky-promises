import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateBatteryStatus(token: string | null, batteryLevel: number) {
  if (!token) {
    return;
  }
  
  const res = await axios.put(
    `${BASE_URL}/battery-status/update`,
    { batteryLevel },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

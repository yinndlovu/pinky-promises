import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateGeoInfo(
  token: string,
  latitude: number,
  longitude: number
) {
  const res = await axios.put(
    `${BASE_URL}/api/user-weather/update`,
    { latitude, longitude },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

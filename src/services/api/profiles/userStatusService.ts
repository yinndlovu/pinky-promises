import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateUserStatus(
  token: string,
  isAtHome: boolean,
  homeDistance?: number
) {
  await axios.put(
    `${BASE_URL}/user-status/update`,
    isAtHome
      ? { isAtHome }
      : {
          isAtHome,
          homeDistance:
            homeDistance != null ? Math.round(homeDistance) : undefined,
        },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getServerTheme(token: string) {
  const res = await axios.get("/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

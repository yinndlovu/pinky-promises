// external
import axios from "axios";
import { encode } from "base64-arraybuffer";

// internal
import { BASE_URL } from "../../../configuration/config";

export async function getProfile(token: string) {
  const response = await axios.get(`${BASE_URL}/profile/get-profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.user;
}

export async function getUserProfile(userId: string, token: string) {
  const response = await axios.get(
    `${BASE_URL}/profile/get-user-profile/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data.profile;
}

export async function fetchProfilePicture(userId: string, token: string) {
  const response = await axios.get(
    `${BASE_URL}/profile/get-profile-picture/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    }
  );

  const mime = response.headers["content-type"] || "image/jpeg";
  const base64 = `data:${mime};base64,${encode(response.data)}`;

  const lastModified = response.headers["last-modified"];
  const updatedAt = lastModified ? new Date(lastModified) : new Date();

  return { base64, updatedAt };
}

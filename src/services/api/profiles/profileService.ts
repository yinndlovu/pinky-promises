// external
import axios from "axios";
import { encode } from "base64-arraybuffer";

// internal
import { BASE_URL } from "../../../configuration/config";

export async function getProfile(token: string | null, userId: string) {
  if (!token) {
    return;
  }

  const response = await axios.get(`${BASE_URL}/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.user;
}

export async function fetchProfilePicture(userId: string, token: string | null) {
  if (!token) {
    throw new Error("No token provided");
  }

  const response = await axios.get(
    `${BASE_URL}/profile/${userId}/profile-picture`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    }
  );

  const mime = response.headers["content-type"] || "image/jpeg";
  const base64 = `data:${mime};base64,${encode(response.data)}`;

  const lastModified = response.headers["last-modified"];
  const updatedAt = lastModified ? new Date(lastModified) : new Date();

  return { uri: base64, updatedAt };
}

export async function updateProfilePicture(
  token: string | null,
  base64String: string
) {
  if (!token) {
    return;
  }

  return axios.put(
    `${BASE_URL}/profile/profile-picture/update`,
    { image: base64String },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function updateProfileField(
  field: "name" | "username" | "bio",
  value: string,
  token: string | null
) {
  if (!token) {
    return;
  }
  
  let url = "";
  let body: Record<string, string> = {};

  switch (field) {
    case "name":
      url = `${BASE_URL}/profile/update-name`;
      body = { name: value };
      break;
    case "username":
      url = `${BASE_URL}/profile/update-username`;
      body = { username: value };
      break;
    case "bio":
      url = `${BASE_URL}/profile/update-bio`;
      body = { bio: value };
      break;
  }

  return axios.put(url, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

import { BASE_URL } from "../../configuration/config";

export interface CachedImageInfo {
  userId: string;
  updatedAt: string | number;
}

export const buildCachedImageUrl = (
  userId: string,
  updatedAt: string | number
): string => {
  const version =
    typeof updatedAt === "number"
      ? updatedAt
      : Math.floor(new Date(updatedAt).getTime() / 1000);

  return `${BASE_URL}/profile/${userId}/profile-picture?v=${version}`;
};

export const preloadProfileImages = (images: CachedImageInfo[]): void => {
  const { Image } = require("expo-image");

  const imageSources = images.map(({ userId, updatedAt }) => ({
    uri: buildCachedImageUrl(userId, updatedAt),
  }));

  Image.prefetch(imageSources);
};

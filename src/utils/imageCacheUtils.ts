import { BASE_URL } from "../configuration/config";

export interface CachedImageInfo {
  userId: string;
  updatedAt: string | Date;
}

export const buildCachedImageUrl = (
  userId: string,
  updatedAt: string | Date
): string => {
  const timestamp =
    typeof updatedAt === "string" ? updatedAt : updatedAt.toISOString();
  return `${BASE_URL}/api/profile/get-profile-picture/${userId}?v=${timestamp}`;
};

export const preloadProfileImages = (images: CachedImageInfo[]): void => {
    const { Image } = require('expo-image');

  const imageSources = images.map(({ userId, updatedAt }) => ({
    uri: buildCachedImageUrl(userId, updatedAt),
  }));

  Image.prefetch(imageSources);
};

// external
import { useState } from "react";
import { Image } from "expo-image";

// internal
import { buildCachedImageUrl } from "../../utils/cache/imageCacheUtils";
import { useTheme } from "../../theme/ThemeContext";

// content
import AvatarSkeleton from "../skeletons/AvatarSkeleton";

// types
type ProfileImageProps = {
  avatarUri?: string | null;
  avatarFetched: boolean;
  updatedAt?: Date | null;
  userId?: string | number;
  style?: any;
};

export default function ProfileImage(props: ProfileImageProps) {
  // props
  const { avatarUri, avatarFetched, updatedAt, userId, style } = props;

  // hook variables
  const { theme } = useTheme();

  // use states
  const [failed, setFailed] = useState(false);

  // default image
  const defaultSource = require("../../assets/default-avatar-two.png");

  // build a new cache
  let cachedImageUrl: string | null = null;
  if (avatarUri && updatedAt && userId) {
    const timestamp = Math.floor(new Date(updatedAt).getTime() / 1000);
    cachedImageUrl = buildCachedImageUrl(String(userId), timestamp);
  }

  if (!avatarFetched) {
    return (
      <AvatarSkeleton
        style={style}
        darkColor={theme.colors.skeletonDark}
        highlightColor={theme.colors.skeletonHighlight}
      />
    );
  }

  if (!avatarUri) {
    return (
      <Image
        source={defaultSource}
        style={style}
        cachePolicy="disk"
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <Image
      source={
        failed
          ? defaultSource
          : cachedImageUrl
          ? { uri: cachedImageUrl }
          : { uri: avatarUri }
      }
      style={style}
      cachePolicy="disk"
      contentFit="cover"
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

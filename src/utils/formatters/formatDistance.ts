export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters >= 1000) {
    const kilometers = distanceInMeters / 1000;

    if (kilometers >= 100) {
      return `${Math.round(kilometers)} km`;
    }

    return `${kilometers.toFixed(1)} km`;
  }

  return `${distanceInMeters} m`;
};

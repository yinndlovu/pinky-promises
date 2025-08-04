export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters >= 1000) {
    const kilometers = (distanceInMeters / 1000).toFixed(1);
    return `${kilometers} km`;
  }
  return `${distanceInMeters} meters`;
};

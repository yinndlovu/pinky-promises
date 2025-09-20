export const getBatteryIcon = (
  level: number
): "battery" | "battery-70" | "battery-30" | "battery-outline" => {
  if (level >= 80) {
    return "battery";
  }
  if (level >= 60) {
    return "battery-70";
  }
  if (level >= 30) {
    return "battery-30";
  }
  return "battery-outline";
};

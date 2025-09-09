import { weatherIcons } from "./weatherIcons";

export const getWeatherIcon = (
  weatherType?: string | null,
  isDaytime: boolean = true
) => {
  if (!weatherType) {
    return isDaytime ? weatherIcons["clear"] : weatherIcons["clear_night"];
  }

  const normalized = weatherType.trim().toLowerCase().replace(/ /g, "_");

  const key = isDaytime ? normalized : `${normalized}_night`;

  return weatherIcons[key] || weatherIcons["clear"];
};

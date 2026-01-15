// format the date to not show the year in the current year
export function formatDateYearly(dateString: string) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  const now = new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();

  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const formattedHours = hours.toString();

  const showYear = year !== now.getFullYear();
  return `${day} ${month}${
    showYear ? " " + year : ""
  } • ${formattedHours}:${minutes} ${ampm}`;
}

// format the date to DD Mon YYYY HH:mm
export const formatDateDMYHM = (dateStr: string) => {
  if (!dateStr) {
    return "";
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

// format the date to DD Mon YYYY
export const formatDateDMY = (dateStr: string) => {
  if (!dateStr) {
    return "Unknown date";
  }

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// format the date to DD Month YYYY
export const formatDateDMonY = (dateStr: string) => {
  if (!dateStr) {
    return "Unknown date";
  }

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// format the date displayed on profile screen
export const formatProfileDisplayDate = (
  dateString: string,
  timeInfo?: string
): { date: string; timeInfo?: string } => {
  if (!dateString || dateString === "Not set") {
    return {
      date: "Not set",
    };
  }

  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    return {
      date: formattedDate,
      timeInfo,
    };
  } catch (error) {
    return {
      date: dateString,
    };
  }
};

// format time in a given date string
export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return "Unknown time";
  }
};

// format time left until coming date in the home screen
export const formatTimeLeft = (
  daysUntil: number,
  hoursUntil?: number,
  minutesUntil?: number
): string => {
  if (daysUntil === 0) {
    if (hoursUntil != null) {
      if (hoursUntil > 0) {
        return minutesUntil != null && minutesUntil > 0
          ? `${hoursUntil} hour${
              hoursUntil !== 1 ? "s" : ""
            } ${minutesUntil} minute${minutesUntil !== 1 ? "s" : ""} left`
          : `${hoursUntil} hour${hoursUntil !== 1 ? "s" : ""} left`;
      } else if (minutesUntil != null && minutesUntil > 0) {
        return `${minutesUntil} minute${minutesUntil !== 1 ? "s" : ""} left`;
      }
    }
    return "Today";
  }

  if (daysUntil === 1) {
    return hoursUntil != null
      ? `${daysUntil} day ${hoursUntil} hour${hoursUntil !== 1 ? "s" : ""} left`
      : "1 day left";
  }

  if (daysUntil < 30) {
    return `${daysUntil} days left`;
  }

  const months = Math.floor(daysUntil / 30);
  const remainingDays = daysUntil % 30;

  if (months === 1 && remainingDays === 0) {
    return "1 month left";
  }

  if (months === 1) {
    return `1 month ${remainingDays} days left`;
  }

  if (remainingDays === 0) {
    return `${months} months left`;
  }

  return `${months} months ${remainingDays} days left`;
};

// format time ago (e.g., "2 days ago", "3 weeks ago")
export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) {
    return "Unknown";
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  }

  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
};
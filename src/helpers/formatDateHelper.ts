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
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const showYear = year !== now.getFullYear();
  return `${day} ${month}${showYear ? " " + year : ""} • ${hours}:${minutes}`;
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
      hour12: false,
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
    const month = date.toLocaleDateString("en-US", { month: "short" });
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
      hour12: false,
    });
  } catch (error) {
    return "Unknown time";
  }
};

// format time left until coming date in the home screen
export const formatTimeLeft = (daysUntil: number): string => {
  if (daysUntil === 0) {
    return "Today";
  }

  if (daysUntil === 1) {
    return "1 day left";
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

export const getDayLabel = (timestamp: number) => {
  const now = new Date();
  const msgDate = new Date(timestamp);
  const diffTime = now.setHours(0, 0, 0, 0) - msgDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays > 1 && diffDays < 8) {
    return `${diffDays} days ago`;
  }

  return msgDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getTimeLabel = (timestamp: number) => {
  const msgDate = new Date(timestamp);

  return msgDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

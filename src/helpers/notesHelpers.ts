export const formatDateTime = (isoString?: string | null) => {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  
  return (
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
};
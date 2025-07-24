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

function formatCustomDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  // Function to check if two dates have the same day
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  // Function to check if a date is in the same week
  function isSameWeek(date1: Date, date2: Date) {
    const firstDayOfWeek = 1; // 0 is Sunday, 1 is Monday, and so on...

    const currentWeekStart = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate() - ((date2.getDay() - firstDayOfWeek + 7) % 7)
    );

    const currentWeekEnd = new Date(
      currentWeekStart.getFullYear(),
      currentWeekStart.getMonth(),
      currentWeekStart.getDate() + 6
    );

    return (
      date1.getTime() >= currentWeekStart.getTime() &&
      date1.getTime() <= currentWeekEnd.getTime()
    );
  }

  if (isSameDay(date, now)) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return `Yesterday ${new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date)}`;
  }

  if (isSameWeek(date, now)) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Calculate the start of the week

  if (date < startOfWeek) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  if (date < oneYearAgo) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(date);
}

export default formatCustomDate;

export function formatDateString(inputDateString: string) {
  const inputDate = new Date(inputDateString);

  const formattedDate = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${inputDate
    .getDate()
    .toString()
    .padStart(2, "0")} ${inputDate
    .getHours()
    .toString()
    .padStart(2, "0")}:${inputDate.getMinutes().toString().padStart(2, "0")}`;

  return formattedDate;
}

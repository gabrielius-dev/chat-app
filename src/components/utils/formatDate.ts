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
    const diff = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
    const days = diff;
    const dayOfWeek = (date: Date) => ((date.getDay() + 6) % 7) + 1;

    return Math.floor(days / 7) === 0 && dayOfWeek(date1) <= dayOfWeek(date2);
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

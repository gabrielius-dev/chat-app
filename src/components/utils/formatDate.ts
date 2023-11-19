import { DateTime } from "luxon";

function formatCustomDate(dateString: string): string {
  const date: DateTime = DateTime.fromISO(dateString);

  const now: DateTime = DateTime.local();

  if (date.hasSame(now, "day")) {
    return date.toFormat("HH:mm");
  }

  if (date.hasSame(now.minus({ days: 1 }), "day")) {
    return date.toFormat("'Yesterday' HH:mm");
  }

  if (date.hasSame(now, "week")) {
    return date.toFormat("EEEE HH:mm");
  }

  if (date < now.startOf("week")) {
    return date.toFormat("MMMM d HH:mm");
  }

  if (date < now.minus({ years: 1 })) {
    return date.toFormat("yyyy-MMMM-d HH:mm ");
  }

  return date.toFormat("HH:mm");
}

export default formatCustomDate;

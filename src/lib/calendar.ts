export function formatToIcalDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  } catch {
    return isoString;
  }
}

export interface CalendarEventData {
  title: string;
  startAt: string;
  endAt?: string;
  description?: string;
  /** Venue name or a structured address (only `address`/`city` are used). */
  location?: string | { address?: string; city?: string };
  venueName?: string;
}

export function generateGoogleCalendarUrl(event: CalendarEventData) {
  const start = formatToIcalDate(event.startAt);
  // Default end time: 2 hours after start if not provided
  const end = event.endAt 
    ? formatToIcalDate(event.endAt) 
    : formatToIcalDate(new Date(new Date(event.startAt).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const locStr = typeof event.location === 'string' ? event.location : (event.venueName || "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || "",
    location: locStr,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(event: CalendarEventData) {
  const start = formatToIcalDate(event.startAt);
  const end = event.endAt 
    ? formatToIcalDate(event.endAt) 
    : formatToIcalDate(new Date(new Date(event.startAt).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const locStr = typeof event.location === 'string' ? event.location : (event.venueName || "");
  const content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ngetag//Ngetag Calendar//ID
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ""}
LOCATION:${locStr}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

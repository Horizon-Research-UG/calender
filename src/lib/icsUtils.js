// Minimal iCalendar (.ics) export/import helpers for CalSync events.

function pad(n) {
  return String(n).padStart(2, "0");
}

// Format a Date to UTC ICS timestamp: 20260608T140000Z
function toICSDate(date) {
  const d = new Date(date);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

// Format a Date to all-day ICS value: 20260608
function toICSAllDay(date) {
  const d = new Date(date);
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
}

function escapeText(str = "") {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function unescapeText(str = "") {
  return String(str)
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

const FREQ_MAP = {
  daily: "DAILY",
  weekly: "WEEKLY",
  monthly: "MONTHLY",
  yearly: "YEARLY",
};
const FREQ_REVERSE = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

// Build a full .ics document from an array of events.
export function eventsToICS(events, calendarName = "CalSync") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CalSync//DE",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];

  events.forEach((ev) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id || crypto.randomUUID()}@calsync`);
    lines.push(`DTSTAMP:${toICSDate(new Date())}`);
    if (ev.all_day) {
      lines.push(`DTSTART;VALUE=DATE:${toICSAllDay(ev.start_time)}`);
      lines.push(`DTEND;VALUE=DATE:${toICSAllDay(ev.end_time)}`);
    } else {
      lines.push(`DTSTART:${toICSDate(ev.start_time)}`);
      lines.push(`DTEND:${toICSDate(ev.end_time)}`);
    }
    lines.push(`SUMMARY:${escapeText(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
    const freq = ev.recurrence?.frequency;
    if (freq && freq !== "none" && FREQ_MAP[freq]) {
      let rrule = `RRULE:FREQ=${FREQ_MAP[freq]}`;
      if (ev.recurrence.interval && ev.recurrence.interval > 1)
        rrule += `;INTERVAL=${ev.recurrence.interval}`;
      if (ev.recurrence.end_after) rrule += `;COUNT=${ev.recurrence.end_after}`;
      else if (ev.recurrence.end_date)
        rrule += `;UNTIL=${toICSAllDay(ev.recurrence.end_date)}T235959Z`;
      lines.push(rrule);
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// Parse an ICS string into an array of event payloads (without calendar_id).
export function icsToEvents(text) {
  const unfolded = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const lines = unfolded.split(/\r\n|\n|\r/);
  const events = [];
  let cur = null;

  const parseDate = (val) => {
    // val may be like 20260608T140000Z or 20260608
    const m = val.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
    if (!m) return null;
    const [, y, mo, d, h = "00", mi = "00", s = "00", z] = m;
    if (z) {
      return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)).toISOString();
    }
    return new Date(+y, +mo - 1, +d, +h, +mi, +s).toISOString();
  };

  lines.forEach((line) => {
    if (line.startsWith("BEGIN:VEVENT")) {
      cur = { all_day: false, category: "personal", icon: "Calendar" };
    } else if (line.startsWith("END:VEVENT")) {
      if (cur && cur.title && cur.start_time) {
        if (!cur.end_time) cur.end_time = cur.start_time;
        events.push(cur);
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      const rawKey = line.slice(0, idx);
      const value = line.slice(idx + 1);
      const key = rawKey.split(";")[0];

      if (key === "SUMMARY") cur.title = unescapeText(value);
      else if (key === "DESCRIPTION") cur.description = unescapeText(value);
      else if (key === "LOCATION") cur.location = unescapeText(value);
      else if (key === "DTSTART") {
        cur.start_time = parseDate(value);
        if (rawKey.includes("VALUE=DATE") && !value.includes("T")) cur.all_day = true;
      } else if (key === "DTEND") {
        cur.end_time = parseDate(value);
      } else if (key === "RRULE") {
        const parts = {};
        value.split(";").forEach((p) => {
          const [k, v] = p.split("=");
          parts[k] = v;
        });
        if (parts.FREQ && FREQ_REVERSE[parts.FREQ]) {
          cur.recurrence = {
            frequency: FREQ_REVERSE[parts.FREQ],
            interval: parts.INTERVAL ? parseInt(parts.INTERVAL, 10) : 1,
          };
          if (parts.COUNT) cur.recurrence.end_after = parseInt(parts.COUNT, 10);
        }
      }
    }
  });

  return events;
}

export function downloadICS(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
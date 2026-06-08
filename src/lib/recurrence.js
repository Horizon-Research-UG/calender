import {
  addDays, addWeeks, addMonths, addYears, isBefore, isAfter,
  startOfDay, endOfDay, differenceInMilliseconds,
} from "date-fns";

// Expand a base event into concrete occurrences within [rangeStart, rangeEnd]
export function expandEvent(event, rangeStart, rangeEnd) {
  const rec = event.recurrence;
  const baseStart = new Date(event.start_time);
  const baseEnd = new Date(event.end_time);
  const duration = differenceInMilliseconds(baseEnd, baseStart);

  if (!rec || !rec.frequency || rec.frequency === "none") {
    if (baseStart <= rangeEnd && baseEnd >= rangeStart) {
      return [{ ...event, _instanceStart: baseStart, _instanceEnd: baseEnd }];
    }
    return [];
  }

  const interval = rec.interval && rec.interval > 0 ? rec.interval : 1;
  const recEnd = rec.end_date ? endOfDay(new Date(rec.end_date)) : null;
  const maxOccurrences = rec.end_after || 730;

  const occurrences = [];
  let current = new Date(baseStart);
  let count = 0;

  const step = (d) => {
    if (rec.frequency === "daily") return addDays(d, interval);
    if (rec.frequency === "weekly") return addWeeks(d, interval);
    if (rec.frequency === "monthly") return addMonths(d, interval);
    if (rec.frequency === "yearly") return addYears(d, interval);
    return addDays(d, 9999);
  };

  while (count < maxOccurrences) {
    if (recEnd && isAfter(current, recEnd)) break;
    if (isAfter(current, rangeEnd)) break;

    const instEnd = new Date(current.getTime() + duration);
    if (instEnd >= rangeStart && current <= rangeEnd) {
      occurrences.push({
        ...event,
        _instanceStart: new Date(current),
        _instanceEnd: instEnd,
        _isRecurring: true,
      });
    }
    current = step(current);
    count++;
    if (occurrences.length > 400) break;
  }

  return occurrences;
}

export function expandEvents(events, rangeStart, rangeEnd) {
  const rs = startOfDay(rangeStart);
  const re = endOfDay(rangeEnd);
  return events.flatMap((e) => expandEvent(e, rs, re));
}
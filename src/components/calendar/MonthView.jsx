import React from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, format,
} from "date-fns";
import { de } from "date-fns/locale";
import EventChip from "./EventChip";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function MonthView({ date, events, calendarsById, onSelectDate, onEventClick, onDayClick }) {
  const gridStart = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(d); d = addDays(d, 1); }

  const eventsForDay = (day) =>
    events
      .filter((e) => isSameDay(e._instanceStart, day))
      .sort((a, b) => a._instanceStart - b._instanceStart);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center md:text-left">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          const inMonth = isSameMonth(day, date);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={`border-b border-r border-border p-1.5 min-h-[90px] cursor-pointer transition-colors hover:bg-secondary/40 ${!inMonth ? "bg-secondary/20" : ""}`}
            >
              <div className="flex justify-center md:justify-start mb-1">
                <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full font-medium
                  ${isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/40"}`}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev, i) => (
                  <EventChip
                    key={ev.id + "_" + i}
                    event={ev}
                    color={calendarsById[ev.calendar_id]?.color}
                    onClick={onEventClick}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectDate?.(day); }}
                    className="text-[10px] text-muted-foreground font-medium px-1.5 hover:text-primary"
                  >
                    +{dayEvents.length - 3} weitere
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
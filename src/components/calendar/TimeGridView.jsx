import React from "react";
import { startOfWeek, addDays, isSameDay, format, differenceInMinutes, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { getContrastText } from "@/lib/calendarColors";
import { getIcon } from "@/lib/eventIcons";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56;

function PositionedEvent({ event, color, onClick }) {
  const start = event._instanceStart;
  const end = event._instanceEnd;
  const top = (differenceInMinutes(start, startOfDay(start)) / 60) * HOUR_HEIGHT;
  const height = Math.max(22, (differenceInMinutes(end, start) / 60) * HOUR_HEIGHT - 2);
  const bg = event.color || color || "#6366F1";
  const text = getContrastText(bg);
  const IconCmp = getIcon(event.icon);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-left overflow-hidden shadow-sm transition-transform hover:scale-[1.01] z-10"
      style={{ top, height, backgroundColor: bg, color: text }}
    >
      <div className="flex items-center gap-1">
        <IconCmp className="w-3 h-3 shrink-0" />
        <span className="text-[11px] font-semibold truncate">{event.title}</span>
      </div>
      {height > 34 && (
        <div className="text-[10px] opacity-90">{format(start, "HH:mm")} – {format(end, "HH:mm")}</div>
      )}
    </button>
  );
}

export default function TimeGridView({ date, events, calendarsById, mode, onEventClick, onSlotClick }) {
  const days = mode === "day"
    ? [date]
    : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, { weekStartsOn: 1 }), i));

  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border sticky top-0 bg-background z-20">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="flex-1 text-center py-2 border-l border-border">
              <div className="text-[11px] text-muted-foreground capitalize">{format(day, "EEE", { locale: de })}</div>
              <div className={`text-lg font-semibold inline-flex items-center justify-center w-9 h-9 rounded-full mt-0.5
                ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex" style={{ height: 24 * HOUR_HEIGHT }}>
          <div className="w-14 shrink-0">
            {HOURS.map((h) => (
              <div key={h} className="relative border-b border-border/50" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                  {h > 0 ? `${String(h).padStart(2, "0")}:00` : ""}
                </span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e._instanceStart, day) && !e.all_day);
            return (
              <div key={day.toISOString()} className="flex-1 relative border-l border-border">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    onClick={() => onSlotClick?.(day, h)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
                {dayEvents.map((ev, i) => (
                  <PositionedEvent
                    key={ev.id + "_" + i}
                    event={ev}
                    color={calendarsById[ev.calendar_id]?.color}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
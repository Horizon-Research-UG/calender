import React from "react";
import { startOfWeek, addDays, isSameDay, format, differenceInMinutes, startOfDay, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { de } from "date-fns/locale";
import { getContrastText } from "@/lib/calendarColors";
import { getIcon } from "@/lib/eventIcons";
import CurrentTimeLine from "./CurrentTimeLine";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function PositionedEvent({ event, color, onClick, hourHeight }) {
  const start = event._instanceStart;
  const end = event._instanceEnd;
  const top = (differenceInMinutes(start, startOfDay(start)) / 60) * hourHeight;
  const height = Math.max(26, (differenceInMinutes(end, start) / 60) * hourHeight - 2);
  const bg = event.color || color || "#6366F1";
  const text = getContrastText(bg);
  const IconCmp = getIcon(event.icon);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
      className="absolute left-1 right-1 rounded-lg px-2 py-1 text-left overflow-hidden shadow-sm transition-transform hover:scale-[1.01] z-10"
      style={{ top, height, backgroundColor: bg, color: text }}
    >
      <div className="flex items-center gap-1.5">
        <IconCmp className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-semibold truncate">{event.title}</span>
      </div>
      {height > 38 && (
        <div className="text-[11px] opacity-90">{format(start, "HH:mm")} – {format(end, "HH:mm")}</div>
      )}
    </button>
  );
}

const SLOT_MIN = 15;

export default function TimeGridView({ date, events, calendarsById, mode, onEventClick, onSlotSelect }) {
  const isDay = mode === "day";
  const HOUR_HEIGHT = isDay ? 80 : 56;
  const days = isDay
    ? [date]
    : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, { weekStartsOn: 1 }), i));

  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
  }, [HOUR_HEIGHT]);

  // Drag-to-select state: { day, startSlot, endSlot } in 15-min slot indices
  const [drag, setDrag] = React.useState(null);
  const dragRef = React.useRef(null);

  const slotFromOffset = (offsetY) => {
    const slot = Math.floor(offsetY / (HOUR_HEIGHT / 4));
    return Math.max(0, Math.min(95, slot));
  };

  const beginDrag = (e, day) => {
    const slot = slotFromOffset(e.nativeEvent.offsetY);
    const next = { day, startSlot: slot, endSlot: slot };
    dragRef.current = next;
    setDrag(next);
  };
  const moveDrag = (e) => {
    if (!dragRef.current) return;
    const slot = slotFromOffset(e.nativeEvent.offsetY);
    const next = { ...dragRef.current, endSlot: slot };
    dragRef.current = next;
    setDrag(next);
  };
  const endDrag = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d) return;
    const lo = Math.min(d.startSlot, d.endSlot);
    const hi = Math.max(d.startSlot, d.endSlot);
    // single click → default to one slot; drag → inclusive end slot + 1
    const startMin = lo * SLOT_MIN;
    const endMin = (hi + 1) * SLOT_MIN;
    const base = setSeconds(setMilliseconds(d.day, 0), 0);
    const start = setMinutes(setHours(base, 0), startMin);
    const end = setMinutes(setHours(base, 0), endMin);
    onSlotSelect?.(start, end);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border sticky top-0 bg-background z-20">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          if (isDay) {
            return (
              <div key={day.toISOString()} className="flex-1 flex items-center gap-3 px-4 py-3 border-l border-border">
                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl shrink-0
                  ${isToday ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <span className="text-[10px] uppercase tracking-wide opacity-80">{format(day, "EEE", { locale: de })}</span>
                  <span className="text-xl font-bold leading-none">{format(day, "d")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold capitalize">{format(day, "EEEE", { locale: de })}</span>
                  <span className="text-xs text-muted-foreground capitalize">{format(day, "d. MMMM yyyy", { locale: de })}</span>
                </div>
              </div>
            );
          }
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
            const isToday = isSameDay(day, new Date());
            const isDragDay = drag && isSameDay(drag.day, day);
            const dragLo = isDragDay ? Math.min(drag.startSlot, drag.endSlot) : 0;
            const dragHi = isDragDay ? Math.max(drag.startSlot, drag.endSlot) : 0;
            return (
              <div key={day.toISOString()} className="flex-1 relative border-l border-border">
                {HOURS.map((h) => (
                  <div key={h} className="border-b border-border/50 pointer-events-none" style={{ height: HOUR_HEIGHT }} />
                ))}
                {/* Drag-select overlay */}
                <div
                  className="absolute inset-0 cursor-pointer"
                  onMouseDown={(e) => beginDrag(e, day)}
                  onMouseMove={moveDrag}
                  onMouseUp={endDrag}
                  onMouseLeave={() => { if (dragRef.current) endDrag(); }}
                />
                {isDragDay && (
                  <div
                    className="absolute left-1 right-1 rounded-lg bg-primary/20 border border-primary/40 pointer-events-none z-[5]"
                    style={{
                      top: dragLo * (HOUR_HEIGHT / 4),
                      height: (dragHi - dragLo + 1) * (HOUR_HEIGHT / 4),
                    }}
                  />
                )}
                {isToday && <CurrentTimeLine hourHeight={HOUR_HEIGHT} />}
                {dayEvents.map((ev, i) => (
                  <PositionedEvent
                    key={ev.id + "_" + i}
                    event={ev}
                    color={calendarsById[ev.calendar_id]?.color}
                    onClick={onEventClick}
                    hourHeight={HOUR_HEIGHT}
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
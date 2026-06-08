import React from "react";
import { format } from "date-fns";
import { getContrastText } from "@/lib/calendarColors";
import { getIcon } from "@/lib/eventIcons";

export default function EventChip({ event, color, onClick, compact = true, showTime = true }) {
  const bg = event.color || color || "#6366F1";
  const text = getContrastText(bg);
  const IconCmp = getIcon(event.icon);
  const start = event._instanceStart || new Date(event.start_time);

  if (compact) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
        className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium truncate transition-transform hover:scale-[1.02] active:scale-95"
        style={{ backgroundColor: bg, color: text }}
      >
        <IconCmp className="w-3 h-3 shrink-0" />
        {showTime && !event.all_day && (
          <span className="opacity-90 shrink-0">{format(start, "HH:mm")}</span>
        )}
        <span className="truncate">{event.title}</span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
      className="w-full text-left rounded-lg px-2 py-1.5 transition-transform hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
      style={{ backgroundColor: bg, color: text }}
    >
      <div className="flex items-center gap-1.5">
        <IconCmp className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-semibold truncate">{event.title}</span>
      </div>
      {!event.all_day && (
        <div className="text-[10px] opacity-90 mt-0.5">
          {format(start, "HH:mm")}
        </div>
      )}
    </button>
  );
}
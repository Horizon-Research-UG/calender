import React from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, addMonths, subMonths, format,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["M", "D", "M", "D", "F", "S", "S"];

export default function MiniCalendar({ selectedDate, onSelectDate }) {
  const [viewMonth, setViewMonth] = React.useState(startOfMonth(selectedDate));

  React.useEffect(() => {
    setViewMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  const days = [];
  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  let d = gridStart;
  while (d <= gridEnd) { days.push(d); d = addDays(d, 1); }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold capitalize">
          {format(viewMonth, "MMMM yyyy", { locale: de })}
        </span>
        <div className="flex gap-1">
          <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1 rounded-md hover:bg-secondary">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1 rounded-md hover:bg-secondary">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`aspect-square flex items-center justify-center text-[11px] rounded-md transition-colors
                ${isSelected ? "bg-primary text-primary-foreground font-semibold" : isToday ? "text-primary font-semibold" : isCurrentMonth ? "text-foreground hover:bg-secondary" : "text-muted-foreground/40 hover:bg-secondary"}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
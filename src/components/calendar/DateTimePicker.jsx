import React from "react";
import { format, parse, setHours, setMinutes } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Build 30-minute time options for the whole day
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return value;
});

function parseValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function toLocalString(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default function DateTimePicker({ value, onChange, allDay }) {
  const [open, setOpen] = React.useState(false);
  const date = parseValue(allDay ? `${value?.slice(0, 10)}T00:00` : value) || new Date();
  const timeValue = format(date, "HH:mm");

  const handleDateSelect = (selected) => {
    if (!selected) return;
    const merged = allDay
      ? setMinutes(setHours(selected, 0), 0)
      : setMinutes(setHours(selected, date.getHours()), date.getMinutes());
    onChange(allDay ? format(merged, "yyyy-MM-dd") + "T00:00" : toLocalString(merged));
    setOpen(false);
  };

  const handleTimeChange = (t) => {
    const [h, m] = t.split(":").map(Number);
    const merged = setMinutes(setHours(date, h), m);
    onChange(toLocalString(merged));
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex-1 flex items-center gap-2 h-11 px-3 rounded-md border border-input bg-transparent text-sm hover:bg-accent transition-colors text-left"
          >
            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">{format(date, "EEE, d. MMM yyyy", { locale: de })}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus locale={de} weekStartsOn={1} />
        </PopoverContent>
      </Popover>

      {!allDay && (
        <Select value={timeValue} onValueChange={handleTimeChange}>
          <SelectTrigger className="w-28 h-11">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {TIME_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
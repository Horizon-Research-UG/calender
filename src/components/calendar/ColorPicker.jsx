import React from "react";
import { Check } from "lucide-react";
import { CALENDAR_COLORS } from "@/lib/calendarColors";

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CALENDAR_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: c.value }}
          title={c.name}
        >
          {value === c.value && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}
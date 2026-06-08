import React from "react";
import { ICON_OPTIONS, getIcon } from "@/lib/eventIcons";

export default function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_OPTIONS.map((name) => {
        const IconCmp = getIcon(name);
        const active = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`aspect-square flex items-center justify-center rounded-lg border transition-all
              ${active ? "border-primary bg-accent text-primary" : "border-border hover:bg-secondary text-muted-foreground"}`}
          >
            <IconCmp className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
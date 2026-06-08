import React from "react";
import { Check, ChevronRight, Plus } from "lucide-react";

export default function CalendarGroup({
  title, list, hiddenIds, onToggleCalendar, onEditCalendar, onAdd, defaultOpen = true,
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="mb-3">
      <div className="group flex items-center gap-1 px-1 mb-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 flex-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-1"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
          {title}
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5"
            title="Kalender hinzufügen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-0.5">
          {list.length === 0 && (
            <p className="text-xs text-muted-foreground/60 px-1 py-1">Keine Kalender</p>
          )}
          {list.map((cal) => {
            const visible = !hiddenIds.includes(cal.id);
            return (
              <div key={cal.id} className="group flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-secondary transition-colors">
                <button
                  onClick={() => onToggleCalendar(cal.id)}
                  className="w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 transition-all"
                  style={{ backgroundColor: visible ? cal.color : "transparent", border: `2px solid ${cal.color}` }}
                >
                  {visible && <Check className="w-3 h-3" style={{ color: "#fff" }} strokeWidth={3} />}
                </button>
                <button
                  onClick={() => onEditCalendar(cal)}
                  className="flex-1 text-left text-sm truncate text-foreground"
                >
                  {cal.name}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
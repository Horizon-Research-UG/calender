import React from "react";
import { Plus, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import MiniCalendar from "./MiniCalendar";

export default function CalendarSidebar({
  selectedDate, onSelectDate, calendars, hiddenIds, onToggleCalendar,
  onNewEvent, onNewCalendar, onEditCalendar, onOpenSettings,
}) {
  const myCalendars = calendars.filter((c) => c.type === "personal");
  const groupCalendars = calendars.filter((c) => c.type === "group");

  const renderGroup = (title, list) => (
    <div className="mb-6">
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{title}</div>
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
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Button onClick={onNewEvent} className="w-full h-11 mb-6 font-medium shadow-sm rounded-xl">
        <Plus className="w-4 h-4 mr-2" /> Neuer Termin
      </Button>

      <div className="mb-6">
        <MiniCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderGroup("Meine Kalender", myCalendars)}
        {renderGroup("Gruppen", groupCalendars)}
      </div>

      <div className="mt-2 pt-2 border-t border-border">
        <Button variant="ghost" onClick={onNewCalendar} className="w-full justify-start text-muted-foreground">
          <Plus className="w-4 h-4 mr-2" /> Kalender hinzufügen
        </Button>
        <Button variant="ghost" onClick={onOpenSettings} className="w-full justify-start text-muted-foreground">
          <Settings className="w-4 h-4 mr-2" /> Weitere Einstellungen
        </Button>
      </div>
    </div>
  );
}
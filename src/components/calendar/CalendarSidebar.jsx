import React from "react";
import { Plus, Settings, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import MiniCalendar from "./MiniCalendar";
import CalendarGroup from "./CalendarGroup";

export default function CalendarSidebar({
  selectedDate, onSelectDate, calendars, hiddenIds, onToggleCalendar,
  onNewEvent, onNewCalendar, onEditCalendar, onOpenSettings,
}) {
  const [miniOpen, setMiniOpen] = React.useState(true);
  const myCalendars = calendars.filter((c) => c.type === "personal");
  const groupCalendars = calendars.filter((c) => c.type === "group");

  return (
    <div className="flex flex-col h-full">
      <Button onClick={onNewEvent} className="w-full h-11 mb-4 font-medium shadow-sm rounded-xl">
        <Plus className="w-4 h-4 mr-2" /> Neuer Termin
      </Button>

      <div className="mb-3">
        <button
          onClick={() => setMiniOpen((o) => !o)}
          className="flex items-center gap-1 w-full text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-1 px-1 mb-1"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${miniOpen ? "rotate-90" : ""}`} />
          <CalendarDays className="w-3.5 h-3.5" />
          Datum
        </button>
        {miniOpen && <MiniCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <CalendarGroup
          title="Meine Kalender"
          list={myCalendars}
          hiddenIds={hiddenIds}
          onToggleCalendar={onToggleCalendar}
          onEditCalendar={onEditCalendar}
          onAdd={onNewCalendar}
        />
        <CalendarGroup
          title="Gruppen"
          list={groupCalendars}
          hiddenIds={hiddenIds}
          onToggleCalendar={onToggleCalendar}
          onEditCalendar={onEditCalendar}
          defaultOpen={false}
        />
      </div>

      <div className="mt-2 pt-2 border-t border-border">
        <Button variant="ghost" onClick={onOpenSettings} className="w-full justify-start text-muted-foreground">
          <Settings className="w-4 h-4 mr-2" /> Weitere Einstellungen
        </Button>
      </div>
    </div>
  );
}
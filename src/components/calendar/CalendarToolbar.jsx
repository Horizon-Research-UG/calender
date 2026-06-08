import React from "react";
import { ChevronLeft, ChevronRight, Menu, Bell } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const VIEWS = [
  { key: "day", label: "Tag" },
  { key: "week", label: "Woche" },
  { key: "month", label: "Monat" },
];

export default function CalendarToolbar({ view, onViewChange, date, label, onPrev, onNext, onToday, onMenu, inviteCount, onShowInvites }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
          <Menu className="w-5 h-5" />
        </button>
        <Button variant="outline" size="sm" onClick={onToday} className="rounded-lg">Heute</Button>
        <div className="flex items-center">
          <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-secondary"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-secondary"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <h2 className="text-base sm:text-lg font-semibold capitalize truncate">{label}</h2>
      </div>

      <div className="flex items-center gap-2">
        {inviteCount > 0 && (
          <button onClick={onShowInvites} className="relative p-2 rounded-lg hover:bg-secondary">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {inviteCount}
            </span>
          </button>
        )}
        <div className="flex bg-secondary rounded-lg p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => onViewChange(v.key)}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md font-medium transition-colors
                ${view === v.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
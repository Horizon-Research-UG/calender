import React from "react";
import { base44 } from "@/api/base44Client";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths,
  addWeeks, subWeeks, addDays, subDays, format, setHours, setMinutes,
  setSeconds, setMilliseconds,
} from "date-fns";
import { de } from "date-fns/locale";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { expandEvents } from "@/lib/recurrence";

import CalendarToolbar from "@/components/calendar/CalendarToolbar";
import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import MonthView from "@/components/calendar/MonthView";
import TimeGridView from "@/components/calendar/TimeGridView";
import EventDialog from "@/components/calendar/EventDialog";
import CalendarDialog from "@/components/calendar/CalendarDialog";
import InvitesDialog from "@/components/calendar/InvitesDialog";
import SettingsDialog from "@/components/calendar/SettingsDialog";

export default function CalendarPage() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();

  const [view, setView] = React.useState("month");
  const [date, setDate] = React.useState(new Date());
  const [calendars, setCalendars] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [invites, setInvites] = React.useState([]);
  const [hiddenIds, setHiddenIds] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [eventDialog, setEventDialog] = React.useState({ open: false, event: null, date: null });
  const [calDialog, setCalDialog] = React.useState({ open: false, calendar: null });
  const [invitesOpen, setInvitesOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const calendarsById = React.useMemo(() => {
    const m = {};
    calendars.forEach((c) => { m[c.id] = c; });
    return m;
  }, [calendars]);

  const loadData = React.useCallback(async () => {
    if (!user) return;
    const [cals, evs, invs] = await Promise.all([
      base44.entities.Calendar.list("-created_date", 200),
      base44.entities.Event.list("-start_time", 1000),
      base44.entities.CalendarInvite.filter({ invited_email: user.email, status: "pending" }),
    ]);

    // Filter calendars: owned or member
    const visible = cals.filter((c) =>
      c.created_by_id === user.id ||
      (c.members || []).some((m) => m.email === user.email)
    );

    // Ensure a default personal calendar exists
    if (visible.length === 0) {
      const created = await base44.entities.Calendar.create({
        name: "Mein Kalender", color: "#6366F1", type: "personal",
        members: [{ email: user.email, role: "owner" }],
      });
      visible.push(created);
    }

    const visIds = visible.map((c) => c.id);
    setCalendars(visible);
    setEvents(evs.filter((e) => visIds.includes(e.calendar_id)));
    setInvites(invs);
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    if (isAuthenticated && user) loadData();
    else if (!isAuthenticated) setLoading(false);
  }, [isAuthenticated, user, loadData]);

  // Date range for current view
  const { rangeStart, rangeEnd, label } = React.useMemo(() => {
    if (view === "month") {
      return {
        rangeStart: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
        rangeEnd: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
        label: format(date, "MMMM yyyy", { locale: de }),
      };
    }
    if (view === "week") {
      const ws = startOfWeek(date, { weekStartsOn: 1 });
      const we = endOfWeek(date, { weekStartsOn: 1 });
      return { rangeStart: ws, rangeEnd: we, label: `${format(ws, "d. MMM", { locale: de })} – ${format(we, "d. MMM yyyy", { locale: de })}` };
    }
    return { rangeStart: date, rangeEnd: date, label: format(date, "EEEE, d. MMMM yyyy", { locale: de }) };
  }, [view, date]);

  const visibleEvents = React.useMemo(() => {
    const filtered = events.filter((e) => !hiddenIds.includes(e.calendar_id));
    return expandEvents(filtered, rangeStart, rangeEnd);
  }, [events, hiddenIds, rangeStart, rangeEnd]);

  // Navigation
  const navigate = (dir) => {
    if (view === "month") setDate((d) => dir > 0 ? addMonths(d, 1) : subMonths(d, 1));
    else if (view === "week") setDate((d) => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setDate((d) => dir > 0 ? addDays(d, 1) : subDays(d, 1));
  };

  const toggleCalendar = (id) =>
    setHiddenIds((h) => h.includes(id) ? h.filter((x) => x !== id) : [...h, id]);

  // Event CRUD
  const openNewEvent = (d) => setEventDialog({ open: true, event: null, date: d || date });
  const openSlot = (day, hour, minute = 0) => {
    const start = setSeconds(setMilliseconds(setMinutes(setHours(day, hour), minute), 0), 0);
    setEventDialog({ open: true, event: null, date: start });
  };

  const saveEvent = async (payload) => {
    const existing = eventDialog.event;
    const realId = existing?._sourceId || existing?.id;
    // Strip recurrence-instance fields that aren't real entity attributes
    const { _sourceId, _instanceStart, _instanceEnd, id, created_date, updated_date, created_by_id, ...clean } = payload;
    if (existing) {
      try {
        await base44.entities.Event.update(realId, clean);
        toast.success("Termin aktualisiert");
      } catch (e) {
        // Event was deleted elsewhere — fall back to creating it
        await base44.entities.Event.create(clean);
        toast.success("Termin erstellt");
      }
    } else {
      await base44.entities.Event.create(clean);
      if (clean.invitees?.length) sendInviteEmails(clean);
      toast.success("Termin erstellt");
    }
    setEventDialog({ open: false, event: null, date: null });
    loadData();
  };

  const deleteEvent = async (ev) => {
    const realId = ev._sourceId || ev.id;
    try {
      await base44.entities.Event.delete(realId);
      toast.success("Termin gelöscht");
    } catch (e) {
      toast.success("Termin gelöscht");
    }
    setEventDialog({ open: false, event: null, date: null });
    loadData();
  };

  const sendInviteEmails = async (event) => {
    try {
      for (const inv of event.invitees) {
        await base44.integrations.Core.SendEmail({
          to: inv.email,
          subject: `Einladung: ${event.title}`,
          body: `${user.full_name || user.email} hat dich zu "${event.title}" eingeladen.\n\nWann: ${format(new Date(event.start_time), "PPPp", { locale: de })}\n${event.location ? `Wo: ${event.location}\n` : ""}${event.description ? `\n${event.description}` : ""}`,
        });
      }
    } catch (e) { /* email best-effort */ }
  };

  // Calendar CRUD
  const saveCalendar = async (form) => {
    if (calDialog.calendar) {
      await base44.entities.Calendar.update(calDialog.calendar.id, form);
      toast.success("Kalender aktualisiert");
    } else {
      await base44.entities.Calendar.create({
        ...form,
        members: [{ email: user.email, role: "owner" }],
      });
      toast.success("Kalender erstellt");
    }
    setCalDialog({ open: false, calendar: null });
    loadData();
  };

  const deleteCalendar = async (cal) => {
    await base44.entities.Calendar.delete(cal.id);
    toast.success("Kalender gelöscht");
    setCalDialog({ open: false, calendar: null });
    loadData();
  };

  const inviteToCalendar = async (cal, email) => {
    if (!cal) { toast.error("Bitte zuerst den Kalender speichern"); return; }
    const newMembers = [...(cal.members || []), { email, role: "member" }];
    await base44.entities.Calendar.update(cal.id, { members: newMembers });
    await base44.entities.CalendarInvite.create({
      calendar_id: cal.id, calendar_name: cal.name,
      invited_email: email, invited_by: user.email, status: "pending",
    });
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Kalender geteilt: ${cal.name}`,
        body: `${user.full_name || user.email} hat den Kalender "${cal.name}" mit dir geteilt. Öffne die App, um die Einladung anzunehmen.`,
      });
    } catch (e) { /* best effort */ }
    toast.success(`Einladung an ${email} gesendet`);
    setCalDialog((s) => ({ ...s, calendar: { ...cal, members: newMembers } }));
    loadData();
  };

  const importEvents = async (parsed) => {
    if (!parsed.length) { toast.error("Keine Termine in der Datei gefunden"); return; }
    await base44.entities.Event.bulkCreate(parsed);
    toast.success(`${parsed.length} Termine importiert`);
    setSettingsOpen(false);
    loadData();
  };

  const acceptInvite = async (inv) => {
    await base44.entities.CalendarInvite.update(inv.id, { status: "accepted" });
    toast.success("Einladung angenommen");
    loadData();
  };
  const declineInvite = async (inv) => {
    await base44.entities.CalendarInvite.update(inv.id, { status: "declined" });
    loadData();
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Willkommen bei CalSync</h1>
        <p className="text-muted-foreground max-w-sm">Melde dich an, um auf deinen persönlichen Kalender zuzugreifen.</p>
        <button onClick={navigateToLogin} className="px-6 h-11 rounded-xl bg-primary text-primary-foreground font-medium">
          Anmelden
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const sidebar = (
    <CalendarSidebar
      selectedDate={date}
      onSelectDate={(d) => { setDate(d); if (view === "month") setView("day"); setSidebarOpen(false); }}
      calendars={calendars}
      hiddenIds={hiddenIds}
      onToggleCalendar={toggleCalendar}
      onNewEvent={() => { openNewEvent(); setSidebarOpen(false); }}
      onNewCalendar={() => { setCalDialog({ open: true, calendar: null }); setSidebarOpen(false); }}
      onEditCalendar={(c) => { setCalDialog({ open: true, calendar: c }); setSidebarOpen(false); }}
      onOpenSettings={() => { setSettingsOpen(true); setSidebarOpen(false); }}
    />
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border p-4 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">C</div>
          <span className="font-bold text-lg tracking-tight">CalSync</span>
        </div>
        {sidebar}
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-4 overflow-y-auto">
          <div className="mt-4">{sidebar}</div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-w-0">
        <CalendarToolbar
          view={view}
          onViewChange={setView}
          date={date}
          label={label}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
          onToday={() => setDate(new Date())}
          onMenu={() => setSidebarOpen(true)}
          inviteCount={invites.length}
          onShowInvites={() => setInvitesOpen(true)}
        />
        <div className="flex-1 overflow-hidden">
          {view === "month" && (
            <MonthView
              date={date} events={visibleEvents} calendarsById={calendarsById}
              onSelectDate={(d) => { setDate(d); setView("day"); }}
              onEventClick={(ev) => setEventDialog({ open: true, event: ev, date: null })}
              onDayClick={(d) => openNewEvent(d)}
            />
          )}
          {(view === "week" || view === "day") && (
            <TimeGridView
              date={date} events={visibleEvents} calendarsById={calendarsById} mode={view}
              onEventClick={(ev) => setEventDialog({ open: true, event: ev, date: null })}
              onSlotClick={openSlot}
            />
          )}
        </div>
      </main>

      <EventDialog
        open={eventDialog.open}
        onOpenChange={(o) => setEventDialog((s) => ({ ...s, open: o }))}
        event={eventDialog.event}
        calendars={calendars}
        defaultDate={eventDialog.date}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />
      <CalendarDialog
        open={calDialog.open}
        onOpenChange={(o) => setCalDialog((s) => ({ ...s, open: o }))}
        calendar={calDialog.calendar}
        currentUserEmail={user?.email}
        onSave={saveCalendar}
        onDelete={calDialog.calendar ? deleteCalendar : null}
        onInvite={inviteToCalendar}
      />
      <InvitesDialog
        open={invitesOpen}
        onOpenChange={setInvitesOpen}
        invites={invites}
        onAccept={acceptInvite}
        onDecline={declineInvite}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        calendars={calendars}
        events={events}
        onImport={importEvents}
      />
    </div>
  );
}
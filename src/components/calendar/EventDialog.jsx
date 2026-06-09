import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, MapPin, X, Plus, Mail, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/calendarColors";
import IconPicker from "./IconPicker";
import ColorPicker from "./ColorPicker";
import DateTimePicker from "./DateTimePicker";

const empty = (defaults = {}) => ({
  title: "",
  description: "",
  location: "",
  start_time: "",
  end_time: "",
  all_day: false,
  calendar_id: "",
  color: "",
  icon: "Calendar",
  category: "personal",
  recurrence: { frequency: "none", interval: 1 },
  invitees: [],
  ...defaults,
});

function toInput(dt) {
  if (!dt) return "";
  return format(new Date(dt), "yyyy-MM-dd'T'HH:mm");
}

export default function EventDialog({ open, onOpenChange, event, calendars, defaultDate, onSave, onDelete }) {
  const [form, setForm] = React.useState(empty());
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (event) {
      setForm({ ...empty(), ...event, recurrence: event.recurrence || { frequency: "none", interval: 1 }, invitees: event.invitees || [] });
    } else {
      const base = defaultDate instanceof Date ? defaultDate : new Date();
      const start = new Date(base);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const personal = calendars.find((c) => c.type === "personal");
      setForm(empty({
        start_time: toInput(start),
        end_time: toInput(end),
        calendar_id: personal?.id || calendars[0]?.id || "",
      }));
    }
    setInviteEmail("");
    setShowMore(false);
  }, [open, event, defaultDate, calendars]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setRec = (k, v) => setForm((f) => ({ ...f, recurrence: { ...f.recurrence, [k]: v } }));

  const addInvitee = () => {
    const email = inviteEmail.trim();
    if (!email || form.invitees.some((i) => i.email === email)) return;
    set("invitees", [...form.invitees, { email, status: "pending" }]);
    setInviteEmail("");
  };

  const removeInvitee = (email) => set("invitees", form.invitees.filter((i) => i.email !== email));

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (!form.title || !form.start_time || !form.end_time) return;
    const payload = {
      ...form,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Termin bearbeiten" : "Neuer Termin"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave}>
        <div className="space-y-4 py-2">
          <Input
            autoFocus
            placeholder="Titel hinzufügen"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="text-lg font-medium border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          />

          <div className="flex items-center justify-between">
            <Label className="text-sm">Ganztägig</Label>
            <Switch checked={form.all_day} onCheckedChange={(v) => set("all_day", v)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start</Label>
            <DateTimePicker value={form.start_time} allDay={form.all_day} onChange={(v) => set("start_time", v)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ende</Label>
            <DateTimePicker value={form.end_time} allDay={form.all_day} onChange={(v) => set("end_time", v)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Kalender</Label>
            <Select value={form.calendar_id} onValueChange={(v) => set("calendar_id", v)}>
              <SelectTrigger><SelectValue placeholder="Kalender wählen" /></SelectTrigger>
              <SelectContent>
                {calendars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showMore ? "rotate-90" : ""}`} />
            Weitere Optionen
          </button>

          {showMore && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Kategorie</Label>
                  <Select value={form.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Wiederholung</Label>
                  <Select value={form.recurrence.frequency} onValueChange={(v) => setRec("frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="yearly">Jährlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.recurrence.frequency !== "none" && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Alle (Intervall)</Label>
                    <Input type="number" min="1" value={form.recurrence.interval}
                      onChange={(e) => setRec("interval", parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Endet am (optional)</Label>
                    <Input type="date" value={form.recurrence.end_date || ""}
                      onChange={(e) => setRec("end_date", e.target.value)} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ort</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Ort hinzufügen" value={form.location} onChange={(e) => set("location", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Beschreibung</Label>
                <Textarea placeholder="Notizen..." value={form.description} onChange={(e) => set("description", e.target.value)} className="h-20" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Farbe</Label>
                <ColorPicker value={form.color} onChange={(v) => set("color", v)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Symbol</Label>
                <IconPicker value={form.icon} onChange={(v) => set("icon", v)} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Gäste einladen</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" type="email" placeholder="email@beispiel.de" value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInvitee(); } }} />
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={addInvitee}><Plus className="w-4 h-4" /></Button>
                </div>
                {form.invitees.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {form.invitees.map((inv) => (
                      <span key={inv.email} className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full">
                        {inv.email}
                        <button onClick={() => removeInvitee(inv.email)}><X className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {event && (
            <Button type="button" variant="ghost" onClick={() => onDelete(event)} className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto">
              <Trash2 className="w-4 h-4 mr-2" /> Löschen
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button type="submit" disabled={!form.title || !form.start_time}>Speichern</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
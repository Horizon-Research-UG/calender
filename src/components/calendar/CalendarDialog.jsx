import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Plus, X, Trash2, Users } from "lucide-react";
import ColorPicker from "./ColorPicker";

const empty = () => ({ name: "", color: "#6366F1", description: "", type: "personal", members: [] });

export default function CalendarDialog({ open, onOpenChange, calendar, currentUserEmail, onSave, onDelete, onInvite }) {
  const [form, setForm] = React.useState(empty());
  const [inviteEmail, setInviteEmail] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setForm(calendar ? { ...empty(), ...calendar, members: calendar.members || [] } : empty());
    setInviteEmail("");
  }, [open, calendar]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleInvite = () => {
    const email = inviteEmail.trim();
    if (!email) return;
    onInvite(calendar, email);
    setInviteEmail("");
  };

  const isOwner = !calendar || (calendar.members || []).some((m) => m.email === currentUserEmail && m.role === "owner") || calendar.created_by_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{calendar ? "Kalender bearbeiten" : "Neuer Kalender"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input autoFocus placeholder="z.B. Familie, Arbeit, Sport" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Typ</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => set("type", "personal")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${form.type === "personal" ? "border-primary bg-accent text-primary font-medium" : "border-border text-muted-foreground"}`}>
                Persönlich
              </button>
              <button type="button" onClick={() => set("type", "group")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${form.type === "group" ? "border-primary bg-accent text-primary font-medium" : "border-border text-muted-foreground"}`}>
                Gruppe
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Farbe</Label>
            <ColorPicker value={form.color} onChange={(v) => set("color", v)} />
          </div>

          {calendar && form.type === "group" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Mitglieder teilen</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" type="email" placeholder="email@beispiel.de" value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInvite(); } }} />
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleInvite}><Plus className="w-4 h-4" /></Button>
              </div>
              {(form.members || []).length > 0 && (
                <div className="space-y-1 pt-1">
                  {form.members.map((m) => (
                    <div key={m.email} className="flex items-center justify-between text-xs bg-secondary px-2.5 py-1.5 rounded-lg">
                      <span>{m.email}</span>
                      <span className="text-muted-foreground capitalize">{m.role === "owner" ? "Besitzer" : "Mitglied"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {calendar && onDelete && (
            <Button variant="ghost" onClick={() => onDelete(calendar)} className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto">
              <Trash2 className="w-4 h-4 mr-2" /> Löschen
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => onSave(form)} disabled={!form.name}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
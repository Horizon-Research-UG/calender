import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import { eventsToICS, icsToEvents, downloadICS } from "@/lib/icsUtils";

export default function SettingsDialog({
  open, onOpenChange, calendars, events, onImport,
}) {
  const [exportCalId, setExportCalId] = React.useState("");
  const [importCalId, setImportCalId] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    if (open && calendars.length) {
      setExportCalId((id) => id || calendars[0].id);
      setImportCalId((id) => id || calendars[0].id);
    }
  }, [open, calendars]);

  const handleExport = () => {
    const cal = calendars.find((c) => c.id === exportCalId);
    if (!cal) return;
    const calEvents = events.filter((e) => e.calendar_id === cal.id);
    const ics = eventsToICS(calEvents, cal.name);
    downloadICS(cal.name, ics);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !importCalId) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = icsToEvents(text).map((ev) => ({ ...ev, calendar_id: importCalId }));
      await onImport(parsed);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Weitere Einstellungen</DialogTitle>
          <DialogDescription>Kalender importieren oder exportieren (.ics)</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Export */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Download className="w-4 h-4" /> Kalender exportieren
            </div>
            <p className="text-xs text-muted-foreground">
              Lade einen Kalender als .ics-Datei herunter (z. B. für Google oder Apple Kalender).
            </p>
            <div className="flex gap-2">
              <Select value={exportCalId} onValueChange={setExportCalId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Kalender wählen" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExport} disabled={!exportCalId}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Import */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="w-4 h-4" /> Kalender importieren
            </div>
            <p className="text-xs text-muted-foreground">
              Importiere Termine aus einer .ics-Datei in einen ausgewählten Kalender.
            </p>
            <Select value={importCalId} onValueChange={setImportCalId}>
              <SelectTrigger>
                <SelectValue placeholder="Ziel-Kalender wählen" />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={fileRef}
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={!importCalId || importing}
              onClick={() => fileRef.current?.click()}
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importiere...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> .ics-Datei wählen</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
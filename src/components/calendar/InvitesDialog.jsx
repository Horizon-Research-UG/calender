import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Inbox } from "lucide-react";

export default function InvitesDialog({ open, onOpenChange, invites, onAccept, onDecline }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Einladungen</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {invites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Keine offenen Einladungen</p>
            </div>
          )}
          {invites.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{inv.calendar_name || "Kalender"}</p>
                <p className="text-xs text-muted-foreground truncate">von {inv.invited_by}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onAccept(inv)}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDecline(inv)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneCall, Plus, Trash2, User } from "lucide-react";
import React, { useState, useEffect } from "react";

export interface EmergencyContact {
  id: string;
  name: string;
  contact: string;
}

const STORAGE_KEY = "emergency-contacts";

export function loadEmergencyContacts(): EmergencyContact[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveContacts(contacts: EmergencyContact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export default function EmergencyContactsPanel() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    loadEmergencyContacts,
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !contact.trim()) {
      setError("Name and contact are required.");
      return;
    }
    if (contacts.length >= 3) {
      setError("Maximum 3 emergency contacts allowed.");
      return;
    }
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: name.trim(),
      contact: contact.trim(),
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveContacts(updated);
    setName("");
    setContact("");
    setError("");
  };

  const handleRemove = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PhoneCall className="w-4 h-4 text-primary" />
          Emergency Contacts
          <Badge variant="outline" className="ml-auto text-xs">
            {contacts.length}/3
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.length > 0 && (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50 border border-border"
              >
                <div className="p-1.5 rounded-full bg-primary/20">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.contact}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(c.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {contacts.length < 3 && (
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Add emergency contact
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-background border-border text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Email / Phone
                </Label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+1 555-0100"
                  className="bg-background border-border text-sm h-8"
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              size="sm"
              onClick={handleAdd}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </Button>
          </div>
        )}

        {contacts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No emergency contacts configured. Add up to 3 contacts to receive
            breach alerts.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

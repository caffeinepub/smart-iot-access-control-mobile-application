import type { TimeSlot } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Save } from "lucide-react";
import React, { useState, useEffect } from "react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface DaySchedule {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  uid: string;
  userName: string;
}

export default function AccessWindowModal({
  open,
  onClose,
  uid,
  userName,
}: Props) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map(() => ({ enabled: false, startHour: 9, endHour: 17 })),
  );

  const { data: existingWindow, isLoading } = useQuery({
    queryKey: ["userAccessWindow", uid],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserAccessWindow(uid);
    },
    enabled: !!actor && open && !!uid,
  });

  useEffect(() => {
    if (!existingWindow) return;
    const newSchedule: DaySchedule[] = DAYS.map(() => ({
      enabled: false,
      startHour: 9,
      endHour: 17,
    }));
    for (const slot of existingWindow) {
      const day = Number(slot.day);
      if (day >= 0 && day < 7) {
        newSchedule[day] = {
          enabled: true,
          startHour: Number(slot.startHour),
          endHour: Number(slot.endHour),
        };
      }
    }
    setSchedule(newSchedule);
  }, [existingWindow]);

  const mutation = useMutation({
    mutationFn: async (slots: TimeSlot[]) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserAccessWindow(uid, slots);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAccessWindow", uid] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
  });

  const handleSave = () => {
    const slots: TimeSlot[] = schedule
      .map((day, i) => ({ ...day, dayIndex: i }))
      .filter((d) => d.enabled)
      .map((d) => ({
        day: BigInt(d.dayIndex),
        startHour: BigInt(d.startHour),
        endHour: BigInt(d.endHour),
      }));
    mutation.mutate(slots);
  };

  const updateDay = (
    i: number,
    field: keyof DaySchedule,
    value: boolean | number,
  ) => {
    setSchedule((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)),
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Access Window — {userName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2 py-4">
            {[...Array(7)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable list
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                  schedule[i].enabled
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-background/30"
                }`}
              >
                <Checkbox
                  id={`day-${i}`}
                  checked={schedule[i].enabled}
                  onCheckedChange={(checked) =>
                    updateDay(i, "enabled", !!checked)
                  }
                />
                <Label
                  htmlFor={`day-${i}`}
                  className="w-24 text-sm cursor-pointer"
                >
                  {day}
                </Label>
                {schedule[i].enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      value={schedule[i].startHour}
                      onChange={(e) =>
                        updateDay(i, "startHour", Number(e.target.value))
                      }
                      className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
                    >
                      {Array.from({ length: 24 }, (_, h) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                        <option key={h} value={h}>
                          {h.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">to</span>
                    <select
                      value={schedule[i].endHour}
                      onChange={(e) =>
                        updateDay(i, "endHour", Number(e.target.value))
                      }
                      className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
                    >
                      {Array.from({ length: 24 }, (_, h) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                        <option key={h} value={h}>
                          {h.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {schedule[i].endHour - schedule[i].startHour}h
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending || isLoading}
            className="flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

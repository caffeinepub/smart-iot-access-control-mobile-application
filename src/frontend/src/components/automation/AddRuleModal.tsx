import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useAddSmartRule } from "../../hooks/useQueries";

interface AddRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddRuleModal({
  open,
  onOpenChange,
}: AddRuleModalProps) {
  const [ruleName, setRuleName] = useState("");
  const [action, setAction] = useState("");
  const [schedule, setSchedule] = useState("");
  const [deviceId, setDeviceId] = useState("default");
  const addRule = useAddSmartRule();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleName.trim() || !action.trim() || !schedule.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    addRule.mutate(
      {
        ruleName: ruleName.trim(),
        action: action.trim(),
        schedule: schedule.trim(),
        deviceId: deviceId.trim(),
        active: true,
        createdBy: "admin",
        users: [],
        triggers: [],
      },
      {
        onSuccess: () => {
          toast.success("Rule added successfully");
          setRuleName("");
          setAction("");
          setSchedule("");
          setDeviceId("default");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(`Failed to add rule: ${error.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Automation Rule</DialogTitle>
          <DialogDescription>
            Create a new smart access control rule
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruleName">Rule Name *</Label>
            <Input
              id="ruleName"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Auto-lock after hours"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action *</Label>
            <Textarea
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Lock device automatically"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule *</Label>
            <Input
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Daily at 18:00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="default"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addRule.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {addRule.isPending ? "Adding..." : "Add Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

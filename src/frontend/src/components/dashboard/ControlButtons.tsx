import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { useLockControl } from "../../hooks/useQueries";

interface ControlButtonsProps {
  isLocked: boolean;
  emergencyMode: boolean;
}

export default function ControlButtons({
  isLocked,
  emergencyMode,
}: ControlButtonsProps) {
  const { lockMutation, unlockMutation } = useLockControl();

  const handleLock = () => {
    lockMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Device locked successfully");
      },
      onError: (error) => {
        toast.error(`Failed to lock: ${error.message}`);
      },
    });
  };

  const handleUnlock = () => {
    unlockMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Device unlocked successfully");
      },
      onError: (error) => {
        toast.error(`Failed to unlock: ${error.message}`);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        onClick={handleUnlock}
        disabled={!isLocked || unlockMutation.isPending}
        size="lg"
        className="h-20 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-300 disabled:opacity-50"
      >
        <LockOpen className="w-6 h-6 mr-2" />
        {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
      </Button>

      <Button
        onClick={handleLock}
        disabled={isLocked || lockMutation.isPending}
        size="lg"
        variant="destructive"
        className="h-20 shadow-lg shadow-destructive/20 transition-all duration-300 disabled:opacity-50"
      >
        <Lock className="w-6 h-6 mr-2" />
        {lockMutation.isPending ? "Locking..." : "Lock"}
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="h-20 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-lg transition-all duration-300"
        disabled={emergencyMode}
      >
        <img
          src="/assets/generated/lockdown-icon.dim_128x128.png"
          alt="Lockdown"
          className="w-6 h-6 mr-2"
        />
        Emergency Lockdown
      </Button>
    </div>
  );
}

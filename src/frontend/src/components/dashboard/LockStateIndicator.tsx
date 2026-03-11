import { Lock, LockOpen } from "lucide-react";

interface LockStateIndicatorProps {
  isLocked: boolean;
}

export default function LockStateIndicator({
  isLocked,
}: LockStateIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
          isLocked
            ? "bg-destructive/10 text-destructive shadow-lg shadow-destructive/20"
            : "bg-accent/10 text-accent shadow-lg shadow-accent/20"
        }`}
      >
        {isLocked ? (
          <Lock className="w-12 h-12" />
        ) : (
          <LockOpen className="w-12 h-12" />
        )}
      </div>
      <p
        className={`mt-4 text-2xl font-bold transition-colors ${isLocked ? "text-destructive" : "text-accent"}`}
      >
        {isLocked ? "LOCKED" : "UNLOCKED"}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {isLocked ? "System secured" : "Access granted"}
      </p>
    </div>
  );
}

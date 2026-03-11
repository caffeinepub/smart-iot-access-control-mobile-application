import { Palmtree, X } from "lucide-react";
import { useState } from "react";

interface VacationModeBannerProps {
  isActive: boolean;
}

export default function VacationModeBanner({
  isActive,
}: VacationModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isActive || dismissed) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-warning/10 border-b border-warning/30">
      <Palmtree className="w-4 h-4 text-warning shrink-0 animate-float" />
      <p className="text-sm font-medium text-warning flex-1">
        🌴 Vacation Mode Active — All automation rules suspended. Full lockdown
        in effect.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-warning/60 hover:text-warning transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

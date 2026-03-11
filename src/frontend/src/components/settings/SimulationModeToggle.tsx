import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSimulation } from "../../contexts/SimulationContext";

export default function SimulationModeToggle() {
  const { isSimulationMode, toggleSimulationMode } = useSimulation();

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-accent/20 bg-card">
      <Switch
        id="simulation-mode"
        checked={isSimulationMode}
        onCheckedChange={toggleSimulationMode}
        className="data-[state=checked]:bg-accent"
      />
      <Label
        htmlFor="simulation-mode"
        className="cursor-pointer font-mono text-sm"
      >
        Simulation Mode
      </Label>
    </div>
  );
}

import { Palmtree, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGetVacationModeStatus, useEnableVacationMode, useDisableVacationMode } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function VacationModeToggle() {
  const { data: isActive = false } = useGetVacationModeStatus();
  const enableMutation = useEnableVacationMode();
  const disableMutation = useDisableVacationMode();

  const isPending = enableMutation.isPending || disableMutation.isPending;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      enableMutation.mutate(undefined, {
        onSuccess: () => toast.success('Vacation Mode activated — all access suspended'),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      });
    } else {
      disableMutation.mutate(undefined, {
        onSuccess: () => toast.success('Vacation Mode deactivated'),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      });
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isActive ? 'border-warning/40 bg-warning/5' : 'border-border bg-card'}`}>
      <Palmtree className={`w-6 h-6 ${isActive ? 'text-warning' : 'text-muted-foreground'}`} />
      <div className="flex-1">
        <Label className="text-sm font-semibold cursor-pointer">Vacation / Holiday Mode</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isActive ? 'Active — all automation rules suspended, full lockdown' : 'Suspend all rules and activate full lockdown'}
        </p>
      </div>
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <Switch checked={isActive} onCheckedChange={handleToggle} />
      )}
    </div>
  );
}

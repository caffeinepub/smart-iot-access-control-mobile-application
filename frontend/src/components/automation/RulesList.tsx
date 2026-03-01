import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRemoveSmartRule } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Trash2, Clock, Zap } from 'lucide-react';
import type { SmartRule } from '../../backend';

interface RulesListProps {
  rules: SmartRule[];
}

export default function RulesList({ rules }: RulesListProps) {
  const removeRule = useRemoveSmartRule();

  const handleRemove = (ruleName: string) => {
    removeRule.mutate(ruleName, {
      onSuccess: () => toast.success('Rule removed'),
      onError: (error) => toast.error(`Failed: ${error.message}`),
    });
  };

  if (rules.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No automation rules configured</p>;
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.ruleName}
          className="flex items-center justify-between p-4 rounded-lg border border-accent/10 bg-card hover:bg-accent/5 transition-colors"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-accent" />
              <p className="font-semibold">{rule.ruleName}</p>
              <Badge variant={rule.active ? 'default' : 'outline'} className="text-xs">
                {rule.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{rule.action}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {rule.schedule}
              </span>
              <span>•</span>
              <span>Device: {rule.deviceId}</span>
              <span>•</span>
              <span>By: {rule.createdBy}</span>
            </div>
            {rule.triggers.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Triggers:</span>
                {rule.triggers.map((trigger, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {trigger}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Rule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove "{rule.ruleName}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleRemove(rule.ruleName)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}

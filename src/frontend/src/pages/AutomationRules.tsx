import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";
import AddRuleModal from "../components/automation/AddRuleModal";
import RuleExecutionHistory from "../components/automation/RuleExecutionHistory";
import RulesList from "../components/automation/RulesList";
import { useGetCallerUserRole, useGetSmartRules } from "../hooks/useQueries";

export default function AutomationRules() {
  const { data: rules = [], isLoading } = useGetSmartRules();
  const { data: userRole } = useGetCallerUserRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isAdmin = userRole === UserRole.admin;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access Denied: Only administrators can manage automation rules.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Automation Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure smart access control rules
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </div>

      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            Active Rules
          </CardTitle>
          <CardDescription>Total rules: {rules.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <RulesList rules={rules} />
        </CardContent>
      </Card>

      {/* Rule Execution History */}
      <RuleExecutionHistory />

      <AddRuleModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";
import type { ToDo } from "../../backend";

interface ActivityEntry {
  user: string;
  action: "created" | "completed" | "pending";
  taskTitle: string;
  timestamp: number;
}

interface TodoActivityLogProps {
  todos: ToDo[];
}

export default function TodoActivityLog({ todos }: TodoActivityLogProps) {
  const entries = useMemo<ActivityEntry[]>(() => {
    const result: ActivityEntry[] = [];

    for (const t of todos) {
      result.push({
        user: `${t.owner.toString().slice(0, 12)}...`,
        action: "created",
        taskTitle: t.title,
        timestamp: Number(t.createdAt) / 1_000_000,
      });
      if (t.completed) {
        result.push({
          user: `${t.owner.toString().slice(0, 12)}...`,
          action: "completed",
          taskTitle: t.title,
          timestamp: Number(t.createdAt) / 1_000_000 + 1000,
        });
      }
    }

    return result.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  }, [todos]);

  const actionBadge = (action: ActivityEntry["action"]) => {
    const map = {
      created: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return (
      <Badge variant="outline" className={`text-xs ${map[action]}`}>
        {action}
      </Badge>
    );
  };

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="overflow-auto max-h-64">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">User</TableHead>
            <TableHead className="text-xs">Action</TableHead>
            <TableHead className="text-xs">Task</TableHead>
            <TableHead className="text-xs">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable log entries
            <TableRow key={i}>
              <TableCell className="text-xs font-mono">{entry.user}</TableCell>
              <TableCell>{actionBadge(entry.action)}</TableCell>
              <TableCell className="text-xs max-w-32 truncate">
                {entry.taskTitle}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Medal, Trophy } from "lucide-react";

const MOCK_USERS = [
  { name: "Alex Chen", level: "ELITE", cr: 1248, tasks: 87 },
  { name: "Priya Nair", level: "AGENT", cr: 743, tasks: 52 },
  { name: "Jordan Lee", level: "AGENT", cr: 612, tasks: 44 },
  { name: "Sam Rivera", level: "OPERATOR", cr: 289, tasks: 21 },
  { name: "Morgan Kim", level: "ROOKIE", cr: 84, tasks: 8 },
];

const RANK_ICONS = [
  <Trophy key="1" className="w-4 h-4 text-yellow-400" />,
  <Medal key="2" className="w-4 h-4 text-slate-400" />,
  <Medal key="3" className="w-4 h-4 text-amber-700" />,
];

const levelColors: Record<string, string> = {
  ELITE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  AGENT: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  OPERATOR: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  ROOKIE: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function Leaderboard() {
  return (
    <div
      data-ocid="leaderboard.panel"
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="font-mono font-bold text-sm text-foreground">
          LEADERBOARD
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-mono text-xs w-12">
              RANK
            </TableHead>
            <TableHead className="text-muted-foreground font-mono text-xs">
              NAME
            </TableHead>
            <TableHead className="text-muted-foreground font-mono text-xs">
              LEVEL
            </TableHead>
            <TableHead className="text-muted-foreground font-mono text-xs text-right">
              CR EARNED
            </TableHead>
            <TableHead className="text-muted-foreground font-mono text-xs text-right">
              TASKS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_USERS.map((user, i) => (
            <TableRow
              key={user.name}
              data-ocid={`leaderboard.item.${i + 1}`}
              className="border-border hover:bg-muted/30"
            >
              <TableCell className="font-mono">
                {i < 3 ? (
                  RANK_ICONS[i]
                ) : (
                  <span className="text-muted-foreground text-sm">
                    #{i + 1}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-medium text-foreground text-sm">
                {user.name}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`font-mono text-[9px] uppercase tracking-wider ${levelColors[user.level] || ""}`}
                >
                  {user.level}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-primary font-bold text-sm">
                {user.cr.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground text-sm">
                {user.tasks}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

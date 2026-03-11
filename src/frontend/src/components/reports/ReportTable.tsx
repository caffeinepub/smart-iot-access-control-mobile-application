import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReportRow } from "../../utils/reportUtils";

interface ReportTableProps {
  rows: ReportRow[];
  periodLabel: string;
}

export default function ReportTable({ rows, periodLabel }: ReportTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No data available for this period
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">{periodLabel}</TableHead>
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold text-center">
              <span className="text-success">Success</span>
            </TableHead>
            <TableHead className="font-semibold text-center">
              <span className="text-destructive">Failed</span>
            </TableHead>
            <TableHead className="font-semibold text-center">Total</TableHead>
            <TableHead className="font-semibold text-center">Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => {
            const rate =
              row.total > 0
                ? Math.round((row.successCount / row.total) * 100)
                : 0;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable report rows
              <TableRow key={idx} className="hover:bg-muted/20">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {row.period}
                </TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">
                  {row.userEmail}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className="text-xs border-success/30 text-success bg-success/10"
                  >
                    {row.successCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className="text-xs border-destructive/30 text-destructive bg-destructive/10"
                  >
                    {row.failureCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {row.total}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`text-xs font-semibold ${rate >= 80 ? "text-success" : rate >= 50 ? "text-warning" : "text-destructive"}`}
                  >
                    {rate}%
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

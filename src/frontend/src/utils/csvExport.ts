import type { ReportRow } from "./reportUtils";

export function exportReportToCsv(
  rows: ReportRow[],
  periodLabel: string,
): void {
  const headers = ["User", periodLabel, "Success", "Failure", "Success Rate"];

  const escapeCell = (val: string | number): string => {
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => {
      const rate =
        row.total > 0
          ? `${Math.round((row.successCount / row.total) * 100)}%`
          : "0%";
      return [
        row.userEmail,
        row.period,
        row.successCount,
        row.failureCount,
        rate,
      ]
        .map(escapeCell)
        .join(",");
    }),
  ];

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `access-report-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

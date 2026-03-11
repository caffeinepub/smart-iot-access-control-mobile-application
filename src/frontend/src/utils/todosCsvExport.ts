import type { ToDo } from "../backend";

function getPriorityLabel(priority: ToDo["priority"]): string {
  if (typeof priority === "object") {
    if ("high" in priority) return "high";
    if ("medium" in priority) return "medium";
    return "low";
  }
  return String(priority).toLowerCase();
}

function formatTimestamp(ts: bigint | undefined | null): string {
  if (!ts) return "";
  try {
    return new Date(Number(ts) / 1_000_000).toISOString();
  } catch {
    return "";
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTodosToCsv(todos: ToDo[]): void {
  const headers = [
    "id",
    "title",
    "description",
    "owner",
    "priority",
    "category",
    "dueDate",
    "completed",
    "createdAt",
  ];

  const rows = todos.map((t) => [
    t.id.toString(),
    escapeCsv(t.title),
    escapeCsv(t.description),
    t.owner.toString(),
    getPriorityLabel(t.priority),
    escapeCsv(t.category),
    formatTimestamp(t.dueDate),
    t.completed ? "true" : "false",
    formatTimestamp(t.createdAt),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `todos_export_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

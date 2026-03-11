import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EventSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function EventSearch({
  searchQuery,
  onSearchChange,
}: EventSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search events by user, method, or type..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 border-accent/20"
      />
    </div>
  );
}

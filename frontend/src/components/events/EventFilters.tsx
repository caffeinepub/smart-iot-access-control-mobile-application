import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { AccessEvent } from '../../types/accessEvent';

interface EventFiltersProps {
  events: AccessEvent[];
  selectedMethod: string;
  selectedUser: string;
  onMethodChange: (method: string) => void;
  onUserChange: (user: string) => void;
}

export default function EventFilters({
  events,
  selectedMethod,
  selectedUser,
  onMethodChange,
  onUserChange,
}: EventFiltersProps) {
  const methods = Array.from(new Set(events.map((e) => e.method)));
  const users = Array.from(new Set(events.map((e) => e.userEmail)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Access Method</Label>
        <Select value={selectedMethod} onValueChange={onMethodChange}>
          <SelectTrigger className="border-accent/20">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {methods.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>User</Label>
        <Select value={selectedUser} onValueChange={onUserChange}>
          <SelectTrigger className="border-accent/20">
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

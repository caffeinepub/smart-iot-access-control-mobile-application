import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import { useAddUser } from "../../hooks/useQueries";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserModal({
  open,
  onOpenChange,
}: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rfidUid, setRfidUid] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const addUser = useAddUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !rfidUid.trim() || !pinCode.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    addUser.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        rfidUid: rfidUid.trim(),
        pinCode: pinCode.trim(),
        accessLevel: role,
        role,
        isActive: true,
        lastAccess: BigInt(0),
        failedAttempts: BigInt(0),
        accessWindow: [],
      },
      {
        onSuccess: () => {
          toast.success("User added successfully");
          setName("");
          setEmail("");
          setRfidUid("");
          setPinCode("");
          setRole(UserRole.user);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(`Failed to add user: ${error.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user with access credentials
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfidUid">RFID UID *</Label>
            <Input
              id="rfidUid"
              value={rfidUid}
              onChange={(e) => setRfidUid(e.target.value)}
              placeholder="A1B2C3D4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pinCode">PIN Code *</Label>
            <Input
              id="pinCode"
              type="password"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="4-6 digit PIN"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.admin}>Admin</SelectItem>
                <SelectItem value={UserRole.user}>User</SelectItem>
                <SelectItem value={UserRole.guest}>Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addUser.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {addUser.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddDevice } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Cpu } from 'lucide-react';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddDeviceModal({ open, onOpenChange }: AddDeviceModalProps) {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const addDevice = useAddDevice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId.trim() || !deviceName.trim()) return;

    addDevice.mutate(
      { deviceId: deviceId.trim(), deviceName: deviceName.trim() },
      {
        onSuccess: () => {
          toast.success(`Device "${deviceName}" added successfully`);
          setDeviceId('');
          setDeviceName('');
          onOpenChange(false);
        },
        onError: (err) => toast.error(`Failed to add device: ${err.message}`),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent" />
            Add New Device
          </DialogTitle>
          <DialogDescription>Register a new ESP32 device to the system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              placeholder="e.g., esp32-door-01"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input
              id="deviceName"
              placeholder="e.g., Front Door"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addDevice.isPending || !deviceId.trim() || !deviceName.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {addDevice.isPending ? 'Adding...' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

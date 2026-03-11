import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, LogOut } from "lucide-react";

interface AutoLogoutWarningProps {
  open: boolean;
  secondsLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export default function AutoLogoutWarning({
  open,
  secondsLeft,
  onStayLoggedIn,
  onLogout,
}: AutoLogoutWarningProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md border-warning/30 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <Clock className="w-5 h-5" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            You've been inactive for a while. For security, you'll be
            automatically logged out in:
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-warning/40 bg-warning/5">
            <span className="text-3xl font-bold font-mono text-warning">
              {secondsLeft}
            </span>
            <span className="absolute bottom-3 text-xs text-muted-foreground">
              seconds
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout Now
          </Button>
          <Button
            onClick={onStayLoggedIn}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

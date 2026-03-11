import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rfidUid, setRfidUid] = useState("");
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    saveProfile(
      {
        name: name.trim(),
        email: email.trim(),
        rfidUid: rfidUid.trim() || "N/A",
      },
      {
        onSuccess: () => {
          toast.success("Profile created successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to create profile: ${error.message}`);
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="absolute inset-0 bg-[url('/assets/generated/background-pattern.dim_1920x1080.png')] opacity-5 bg-cover bg-center" />

      <Card className="w-full max-w-md relative z-10 border-accent/20 shadow-2xl shadow-accent/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Set up your account to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-accent/20 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfidUid">RFID UID (Optional)</Label>
              <Input
                id="rfidUid"
                type="text"
                placeholder="Enter RFID UID if available"
                value={rfidUid}
                onChange={(e) => setRfidUid(e.target.value)}
                className="border-accent/20 focus:border-accent"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
            >
              {isPending ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

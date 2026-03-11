import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MapPin, Navigation, Radio } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGeoFencing } from "../../hooks/useGeoFencing";

export default function GeoFencingPanel() {
  const {
    location,
    radius,
    enabled,
    toggleLocation,
    setRadius,
    toggleEnabled,
  } = useGeoFencing();
  const prevLocation = useRef(location);

  useEffect(() => {
    if (
      prevLocation.current !== location &&
      location === "near_home" &&
      enabled
    ) {
      toast.success("📍 You are near home — Auto-unlock triggered!", {
        duration: 4000,
      });
    }
    prevLocation.current = location;
  }, [location, enabled]);

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" />
            <CardTitle className="text-base">Geo-Fencing</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Enable</Label>
            <Switch checked={enabled} onCheckedChange={toggleEnabled} />
          </div>
        </div>
        <CardDescription>Simulate location-based auto-unlock</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Location toggle */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${location === "near_home" ? "bg-success/20" : "bg-muted/50"}`}
          >
            <MapPin
              className={`w-5 h-5 ${location === "near_home" ? "text-success" : "text-muted-foreground"}`}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Current Location</p>
            <Badge
              variant="outline"
              className={`text-xs mt-1 ${location === "near_home" ? "border-success/40 text-success bg-success/10" : "border-muted-foreground/30"}`}
            >
              {location === "near_home" ? "📍 Near Home" : "✈️ Away"}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleLocation}
            disabled={!enabled}
            className="gap-2"
          >
            <Navigation className="w-3 h-3" />
            {location === "near_home" ? "Set Away" : "Arrive Home"}
          </Button>
        </div>

        {/* Radius slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Geo-fence Radius</Label>
            <span className="text-sm font-mono font-semibold text-accent">
              {radius}m
            </span>
          </div>
          <Slider
            min={50}
            max={500}
            step={25}
            value={[radius]}
            onValueChange={([v]) => setRadius(v)}
            disabled={!enabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50m</span>
            <span>500m</span>
          </div>
        </div>

        {!enabled && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Enable geo-fencing to use location-based auto-unlock
          </p>
        )}
      </CardContent>
    </Card>
  );
}

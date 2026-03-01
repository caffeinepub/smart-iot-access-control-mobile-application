interface WiFiStrengthIndicatorProps {
  strength: number;
}

export default function WiFiStrengthIndicator({ strength }: WiFiStrengthIndicatorProps) {
  const getStrengthInfo = (strength: number) => {
    if (strength >= 70) {
      return { label: 'Strong', icon: '/assets/generated/wifi-strong.dim_64x64.png', color: 'text-accent' };
    } else if (strength >= 40) {
      return { label: 'Medium', icon: '/assets/generated/wifi-medium.dim_64x64.png', color: 'text-yellow-500' };
    } else {
      return { label: 'Weak', icon: '/assets/generated/wifi-weak.dim_64x64.png', color: 'text-destructive' };
    }
  };

  const info = getStrengthInfo(strength);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Wi-Fi Signal</span>
      <div className="flex items-center gap-2">
        <img src={info.icon} alt={info.label} className="w-5 h-5" />
        <span className={`text-sm font-semibold ${info.color}`}>{strength}%</span>
      </div>
    </div>
  );
}

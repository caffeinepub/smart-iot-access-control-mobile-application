import { useState } from 'react';
import { Shield, ShieldCheck, QrCode, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const VALID_CODE = '123456';

export default function TwoFactorAuthPanel() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('2fa_enabled') === 'true');
  const [showSetup, setShowSetup] = useState(false);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    if (code === VALID_CODE) {
      setVerified(true);
      setEnabled(true);
      localStorage.setItem('2fa_enabled', 'true');
      toast.success('2FA enabled successfully!');
      setShowSetup(false);
      setCode('');
    } else {
      toast.error('Invalid code. Try 123456 for demo.');
      setCode('');
    }
  };

  const handleDisable = () => {
    setEnabled(false);
    setVerified(false);
    localStorage.setItem('2fa_enabled', 'false');
    toast.info('2FA disabled');
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {enabled ? (
              <ShieldCheck className="w-5 h-5 text-success" />
            ) : (
              <Shield className="w-5 h-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
          </div>
          <Badge variant="outline" className={enabled ? 'border-success/40 text-success bg-success/10' : 'border-muted-foreground/30'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showSetup && !enabled && (
          <Button
            onClick={() => setShowSetup(true)}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Shield className="w-4 h-4" />
            Enable 2FA
          </Button>
        )}

        {enabled && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">2FA is active on your account</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisable} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Disable
            </Button>
          </div>
        )}

        {showSetup && (
          <div className="space-y-5 p-4 rounded-xl border border-accent/20 bg-muted/20">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Scan this QR code with your authenticator app</p>
              <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-xl border-2 border-accent/30 mx-auto">
                <div className="flex flex-col items-center gap-2 text-gray-800">
                  <QrCode className="w-20 h-20" />
                  <span className="text-xs font-mono text-gray-500">DEMO QR</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Or enter manually: <span className="font-mono text-accent">JBSWY3DPEHPK3PXP</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-accent" />
                <Label className="text-sm font-medium">Enter 6-digit verification code</Label>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-center text-muted-foreground">Demo: use code <span className="font-mono text-accent">123456</span></p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowSetup(false); setCode(''); }} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={code.length !== 6}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

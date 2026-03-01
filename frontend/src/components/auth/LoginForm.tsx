import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function LoginForm() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="absolute inset-0 bg-[url('/assets/generated/background-pattern.dim_1920x1080.png')] opacity-5 bg-cover bg-center" />
      
      <Card className="w-full max-w-md relative z-10 border-accent/20 shadow-2xl shadow-accent/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="w-10 h-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Smart Access Control</CardTitle>
          <CardDescription className="text-base">
            ESP32-Integrated IoT Security System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>Secure authentication required</p>
            <p className="text-xs">Multi-layer access control system</p>
          </div>
          
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-300"
          >
            {isLoggingIn ? 'Authenticating...' : 'Login with Internet Identity'}
          </Button>

          <div className="text-xs text-center text-muted-foreground pt-4 border-t border-border">
            <p>Role-based access control</p>
            <p className="mt-1">Admin • Viewer • Guest</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

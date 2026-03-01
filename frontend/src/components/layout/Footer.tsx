import { SiCoffeescript } from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'smart-access-control';

  return (
    <footer className="relative z-10 border-t border-accent/20 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="text-center md:text-left">
            <p className="font-mono text-xs">
              This application interfaces with an ESP32-based smart access system.
            </p>
            <p className="font-mono text-xs mt-1">
              System logic and communication are validated using Wokwi simulation for academic purposes.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span>© {currentYear}</span>
            <span>•</span>
            <span>Built with</span>
            <SiCoffeescript className="w-4 h-4 text-accent" />
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Button } from "@/ui/button";
import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <a
          href="https://muscle-buider.base44.app/Home"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </a>
        <h1 className="text-lg font-bold gradient-text">MC Paskyrų Valdymas</h1>
        <div className="w-24" /> {/* Spacer for centering */}
      </div>
    </header>
  );
}


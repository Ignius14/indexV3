import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

const PIN_STORAGE_KEY = "pin_session_expires_at";
const DEFAULT_PIN = "1234";
const SESSION_TTL_HOURS = 24;

interface PinGateProps {
  children: ReactNode;
}

const getConfiguredPin = () => import.meta.env.VITE_ACCESS_PIN ?? DEFAULT_PIN;

const getSessionExpiry = () => {
  const rawValue = localStorage.getItem(PIN_STORAGE_KEY);
  if (!rawValue) return null;
  const expiry = Number(rawValue);
  return Number.isFinite(expiry) ? expiry : null;
};

const isSessionValid = () => {
  const expiry = getSessionExpiry();
  return expiry !== null && expiry > Date.now();
};

export function PinGate({ children }: PinGateProps) {
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const configuredPin = useMemo(getConfiguredPin, []);

  useEffect(() => {
    if (isSessionValid()) {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (pinInput === configuredPin) {
      const expiry = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;
      localStorage.setItem(PIN_STORAGE_KEY, String(expiry));
      setIsUnlocked(true);
      setError("");
      return;
    }

    setError("Neteisingas PIN kodas.");
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm glass-card rounded-xl p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Įveskite PIN</h1>
          <p className="text-sm text-muted-foreground">
            Sesija galioja 24 val. ir atsinaujina po įvedimo.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            value={pinInput}
            onChange={(event) => setPinInput(event.target.value)}
            placeholder="PIN kodas"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Įeiti
          </Button>
        </form>
      </div>
    </div>
  );
}

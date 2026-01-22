import { Account } from "@/types/account";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { StatusIndicator } from "./StatusIndicator";

interface AccountDetailsModalProps {
  account: Account | null;
  open: boolean;
  onClose: () => void;
  onUpdateUsername: (id: string, username: string) => void;
}

export function AccountDetailsModal({
  account,
  open,
  onClose,
  onUpdateUsername,
}: AccountDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  if (!account) return null;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Nukopijuota!",
      description: `${field} nukopijuota į iškarpinę`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      onUpdateUsername(account.id, newUsername.trim());
      setEditingUsername(false);
      toast({
        title: "Išsaugota!",
        description: "Vartotojo vardas atnaujintas",
      });
    }
  };

  const credentials = [
    { label: "El. paštas", value: account.credentials.email },
    { label: "Microsoft slaptažodis", value: account.credentials.microsoftPassword },
    { label: "El. pašto prisijungimas", value: account.credentials.emailLogin },
    { label: "El. pašto slaptažodis", value: account.credentials.emailPassword },
    { label: "El. pašto svetainė", value: account.credentials.emailWebsite, isLink: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <StatusIndicator isOnline={account.isOnline} size="lg" />
            <span>Paskyros informacija</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Username */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Minecraft nick'as</Label>
            {editingUsername ? (
              <div className="flex gap-2">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Įveskite nick'ą"
                  className="bg-input border-border"
                />
                <Button onClick={handleSaveUsername} size="sm">
                  Išsaugoti
                </Button>
                <Button
                  onClick={() => setEditingUsername(false)}
                  variant="ghost"
                  size="sm"
                >
                  Atšaukti
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-mono text-foreground">
                  {account.username || "Nenustatytas"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewUsername(account.username);
                    setEditingUsername(true);
                  }}
                >
                  Redaguoti
                </Button>
              </div>
            )}
          </div>

          {/* Credentials */}
          {credentials.map((cred) => (
            <div key={cred.label} className="space-y-2">
              <Label className="text-muted-foreground">{cred.label}</Label>
              <div className="flex items-center gap-2 p-3 bg-input rounded-lg">
                {cred.isLink ? (
                  <a
                    href={cred.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-primary hover:underline flex-1 truncate flex items-center gap-2"
                  >
                    {cred.value}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="font-mono text-sm text-foreground flex-1 truncate">
                    {cred.value || "-"}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(cred.value, cred.label)}
                  className="flex-shrink-0"
                >
                  {copiedField === cred.label ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

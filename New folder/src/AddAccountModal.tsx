import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCredentials } from "@/lib/parseCredentials";
import { Account, AccountCredentials } from "@/types/account";
import { Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (account: Omit<Account, "id" | "createdAt" | "isOnline" | "lastChecked">) => void;
  parentAccounts: Account[];
}

export function AddAccountModal({
  open,
  onClose,
  onAdd,
  parentAccounts,
}: AddAccountModalProps) {
  const [rawInput, setRawInput] = useState("");
  const [username, setUsername] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<AccountCredentials>({
    email: "",
    microsoftPassword: "",
    emailLogin: "",
    emailPassword: "",
    emailWebsite: "",
  });

  const handleParse = () => {
    const parsed = parseCredentials(rawInput);
    setCredentials((prev) => ({
      ...prev,
      email: parsed.email || prev.email,
      microsoftPassword: parsed.microsoftPassword || prev.microsoftPassword,
      emailLogin: parsed.emailLogin || prev.emailLogin,
      emailPassword: parsed.emailPassword || prev.emailPassword,
      emailWebsite: parsed.emailWebsite || prev.emailWebsite,
    }));
    toast({
      title: "Išskaidyta!",
      description: "Kredencialai automatiškai užpildyti",
    });
  };

  const handleSubmit = () => {
    if (!credentials.email) {
      toast({
        title: "Klaida",
        description: "El. paštas yra privalomas",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      username,
      credentials,
      parentId,
      proxyId: null,
    });

    // Reset form
    setRawInput("");
    setUsername("");
    setParentId(null);
    setCredentials({
      email: "",
      microsoftPassword: "",
      emailLogin: "",
      emailPassword: "",
      emailWebsite: "",
    });

    onClose();
    toast({
      title: "Pridėta!",
      description: "Nauja paskyra sėkmingai pridėta",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pridėti naują paskyrą</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Raw input for parsing */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Įklijuokite kredencialus (automatinis išskaidymas)
            </Label>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Email: example@mail.com
Microsoft Password: ( Click on: Sign in With Code From Email )
Email Login: example@mail.com
Email Password: password123
Email Website: http://getcode.su/"
              className="bg-input border-border min-h-[120px] font-mono text-sm"
            />
            <Button
              onClick={handleParse}
              variant="secondary"
              className="w-full"
              disabled={!rawInput.trim()}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Automatiškai išskaidyti
            </Button>
          </div>

          <div className="border-t border-border pt-4" />

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Minecraft nick'as</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Įveskite nick'ą"
              className="bg-input border-border"
            />
          </div>

          {/* Parent Account Selection */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Motininis accountas</Label>
            <Select
              value={parentId || "none"}
              onValueChange={(v) => setParentId(v === "none" ? null : v)}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Pasirinkite motininį accountą" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Joks (tai bus motininis)</SelectItem>
                {parentAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.username || acc.credentials.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Credential Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">El. paštas *</Label>
              <Input
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((c) => ({ ...c, email: e.target.value }))
                }
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Microsoft slaptažodis</Label>
              <Input
                value={credentials.microsoftPassword}
                onChange={(e) =>
                  setCredentials((c) => ({ ...c, microsoftPassword: e.target.value }))
                }
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">El. pašto prisijungimas</Label>
              <Input
                value={credentials.emailLogin}
                onChange={(e) =>
                  setCredentials((c) => ({ ...c, emailLogin: e.target.value }))
                }
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">El. pašto slaptažodis</Label>
              <Input
                value={credentials.emailPassword}
                onChange={(e) =>
                  setCredentials((c) => ({ ...c, emailPassword: e.target.value }))
                }
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-muted-foreground">El. pašto svetainė</Label>
              <Input
                value={credentials.emailWebsite}
                onChange={(e) =>
                  setCredentials((c) => ({ ...c, emailWebsite: e.target.value }))
                }
                className="bg-input border-border"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Pridėti paskyrą
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

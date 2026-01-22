import { Account, Proxy } from "@/types/account";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ProxyModalProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  proxies: Proxy[];
  onAddProxy: (proxy: Omit<Proxy, "id" | "accountCount">) => void;
  onDeleteProxy: (id: string) => void;
  onAssignProxy: (accountId: string, proxyId: string | null) => void;
  getProxyAccountCount: (proxyId: string) => number;
}

const MAX_ACCOUNTS_PER_PROXY = 5;

export function ProxyModal({
  open,
  onClose,
  account,
  proxies,
  onAddProxy,
  onDeleteProxy,
  onAssignProxy,
  getProxyAccountCount,
}: ProxyModalProps) {
  const [newProxyName, setNewProxyName] = useState("");
  const [newProxyAddress, setNewProxyAddress] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!account) return null;

  const handleAddProxy = () => {
    if (!newProxyName.trim() || !newProxyAddress.trim()) {
      toast({
        title: "Klaida",
        description: "Užpildykite visus laukus",
        variant: "destructive",
      });
      return;
    }

    onAddProxy({
      name: newProxyName.trim(),
      address: newProxyAddress.trim(),
    });

    setNewProxyName("");
    setNewProxyAddress("");
    setShowAddForm(false);
    toast({
      title: "Pridėta!",
      description: "Naujas proxy pridėtas",
    });
  };

  const handleAssign = (proxyId: string) => {
    const count = getProxyAccountCount(proxyId);
    if (count >= MAX_ACCOUNTS_PER_PROXY && account.proxyId !== proxyId) {
      toast({
        title: "Klaida",
        description: `Šis proxy jau turi ${MAX_ACCOUNTS_PER_PROXY} paskyras`,
        variant: "destructive",
      });
      return;
    }

    onAssignProxy(account.id, proxyId);
    toast({
      title: "Priskirta!",
      description: "Proxy priskirtas prie paskyros",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Proxy valdymas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Paskyra: <span className="text-foreground font-medium">{account.username || account.credentials.email}</span>
          </p>

          {/* Current Proxy Selection */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Priskirtas proxy</Label>
            <Select
              value={account.proxyId || "none"}
              onValueChange={(v) => onAssignProxy(account.id, v === "none" ? null : v)}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Pasirinkite proxy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Joks</SelectItem>
                {proxies.map((proxy) => {
                  const count = getProxyAccountCount(proxy.id);
                  const isFull = count >= MAX_ACCOUNTS_PER_PROXY && account.proxyId !== proxy.id;
                  return (
                    <SelectItem 
                      key={proxy.id} 
                      value={proxy.id}
                      disabled={isFull}
                    >
                      {proxy.name} ({count}/{MAX_ACCOUNTS_PER_PROXY})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Proxy List */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Visi proxy</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {proxies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nėra proxy
                </p>
              ) : (
                proxies.map((proxy) => {
                  const count = getProxyAccountCount(proxy.id);
                  return (
                    <div
                      key={proxy.id}
                      className="flex items-center justify-between p-3 bg-input rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{proxy.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {proxy.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {count}/{MAX_ACCOUNTS_PER_PROXY} paskyrų
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteProxy(proxy.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add New Proxy */}
          {showAddForm ? (
            <div className="space-y-3 p-4 bg-secondary rounded-lg">
              <Input
                value={newProxyName}
                onChange={(e) => setNewProxyName(e.target.value)}
                placeholder="Proxy pavadinimas"
                className="bg-input border-border"
              />
              <Input
                value={newProxyAddress}
                onChange={(e) => setNewProxyAddress(e.target.value)}
                placeholder="Proxy adresas (pvz., 192.168.1.1:8080)"
                className="bg-input border-border"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddProxy} className="flex-1">
                  Pridėti
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Atšaukti
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pridėti naują proxy
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

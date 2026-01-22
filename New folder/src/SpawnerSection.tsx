import { SpawnerTransaction } from "@/types/account";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { lt } from "date-fns/locale";

interface SpawnerSectionProps {
  transactions: SpawnerTransaction[];
  onAdd: (transaction: Omit<SpawnerTransaction, "id">) => void;
  onDelete: (id: string) => void;
}

const SPAWNER_TYPES = [
  "Skeleton",
];

export function SpawnerSection({ transactions, onAdd, onDelete }: SpawnerSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"purchase" | "sale" | "loss">("purchase");
  const [spawnerType, setSpawnerType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [notes, setNotes] = useState("");

  const calculatedTotal = quantity && pricePerUnit 
    ? (parseFloat(quantity) * parseFloat(pricePerUnit)).toFixed(2) 
    : "0.00";

  const handleSubmit = () => {
    if (!spawnerType || !quantity) {
      toast({
        title: "Klaida",
        description: "Užpildykite privalomus laukus",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(quantity);
    const unitPrice = pricePerUnit ? parseFloat(pricePerUnit) : undefined;

    onAdd({
      type,
      spawnerType,
      quantity: qty,
      pricePerUnit: unitPrice,
      totalPrice: unitPrice ? qty * unitPrice : undefined,
      notes: notes || undefined,
      date: new Date(),
    });

    setSpawnerType("");
    setQuantity("");
    setPricePerUnit("");
    setNotes("");
    setShowForm(false);
    toast({
      title: "Pridėta!",
      description: "Spawner įrašas pridėtas",
    });
  };

  const getTypeIcon = (t: "purchase" | "sale" | "loss") => {
    switch (t) {
      case "purchase":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "sale":
        return <TrendingDown className="w-4 h-4 text-primary" />;
      case "loss":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const getTypeLabel = (t: "purchase" | "sale" | "loss") => {
    switch (t) {
      case "purchase":
        return "Pirkimas";
      case "sale":
        return "Pardavimas";
      case "loss":
        return "Praradimas";
    }
  };

  const stats = {
    purchases: transactions.filter((t) => t.type === "purchase").reduce((a, b) => a + b.quantity, 0),
    sales: transactions.filter((t) => t.type === "sale").reduce((a, b) => a + b.quantity, 0),
    losses: transactions.filter((t) => t.type === "loss").reduce((a, b) => a + b.quantity, 0),
    totalSpent: transactions.filter((t) => t.type === "purchase").reduce((a, b) => a + (b.totalPrice || 0), 0),
    totalEarned: transactions.filter((t) => t.type === "sale").reduce((a, b) => a + (b.totalPrice || 0), 0),
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Spawner įrašai</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Pridėti
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-success/10 rounded-lg border border-success/20">
          <p className="text-sm text-muted-foreground">Pirkimai</p>
          <p className="text-2xl font-bold text-success">{stats.purchases}</p>
        </div>
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">Pardavimai</p>
          <p className="text-2xl font-bold text-primary">{stats.sales}</p>
        </div>
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-muted-foreground">Praradimai</p>
          <p className="text-2xl font-bold text-destructive">{stats.losses}</p>
        </div>
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <p className="text-sm text-muted-foreground">Išleista</p>
          <p className="text-xl font-bold text-warning">{stats.totalSpent.toFixed(2)}€</p>
        </div>
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-muted-foreground">Uždirbta</p>
          <p className="text-xl font-bold text-accent">{stats.totalEarned.toFixed(2)}€</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="p-4 bg-secondary rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tipas *</Label>
              <Select value={type} onValueChange={(v) => setType(v as "purchase" | "sale" | "loss")}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Pirkimas</SelectItem>
                  <SelectItem value="sale">Pardavimas</SelectItem>
                  <SelectItem value="loss">Praradimas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Spawner tipas *</Label>
              <Select value={spawnerType} onValueChange={setSpawnerType}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Pasirinkite" />
                </SelectTrigger>
                <SelectContent>
                  {SPAWNER_TYPES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Kiekis *</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Kaina/vnt (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="0.00"
                className="bg-input border-border"
              />
            </div>
          </div>
          
          {/* Calculated Total */}
          {quantity && pricePerUnit && (
            <div className="p-3 bg-input rounded-lg">
              <p className="text-sm text-muted-foreground">Bendra suma:</p>
              <p className="text-xl font-bold text-foreground">{calculatedTotal}€</p>
              <p className="text-xs text-muted-foreground">
                {quantity} vnt × {pricePerUnit}€
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-muted-foreground">Pastabos</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Papildoma informacija..."
              className="bg-input border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Pridėti
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Atšaukti
            </Button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nėra įrašų
          </p>
        ) : (
          [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-input rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.spawnerType} x{transaction.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getTypeLabel(transaction.type)} •{" "}
                      {format(new Date(transaction.date), "yyyy-MM-dd HH:mm", { locale: lt })}
                    </p>
                    {transaction.pricePerUnit !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {transaction.pricePerUnit}€/vnt • Viso: {transaction.totalPrice?.toFixed(2)}€
                      </p>
                    )}
                    {transaction.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(transaction.id)}
                  className="hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
        )}
      </div>
    </Card>
  );
}

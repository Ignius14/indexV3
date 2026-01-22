import { Account, Proxy } from "@/types/account";
import { StatusIndicator } from "./StatusIndicator";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { ChevronDown, ChevronRight, Trash2, Copy, Check, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { StatusResponse } from "@/hooks/useAccountStatus";

interface AccountCardProps {
  account: Account;
  childAccounts?: Account[];
  proxy?: Proxy;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onDelete: (id: string) => void;
  onShowDetails: (account: Account) => void;
  onManageProxy: (account: Account) => void;
  onShowStatus: (account: Account) => void;
  statusResponse?: StatusResponse;
  depth?: number;
}

export function AccountCard({
  account,
  childAccounts = [],
  proxy,
  isExpanded = false,
  onToggleExpand,
  onDelete,
  onShowDetails,
  onManageProxy,
  onShowStatus,
  depth = 0,
}: AccountCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const hasChildren = childAccounts.length > 0;
  const isParent = account.parentId === null;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Nukopijuota!",
      description: `${field} nukopijuota į iškarpinę`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ marginLeft: depth * 24 }}>
      <Card
        className={cn(
          "glass-card p-4 mb-3 transition-all duration-200 hover:bg-card-hover cursor-pointer",
          isParent && "border-l-4 border-l-primary"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Expand/Collapse for parent accounts */}
          {isParent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          )}

          {/* Status Indicator - Clickable */}
          <StatusIndicator 
            isOnline={account.isOnline} 
            clickable={!!account.username}
            onClick={() => {
              if (account.username) {
                onShowStatus(account);
              }
            }}
          />

          {/* Account Info */}
          <div
            className="flex-1 min-w-0"
            onClick={() => onShowDetails(account)}
          >
            <h3 className="font-semibold text-foreground truncate">
              {account.username || "Nėra nick'o"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {account.credentials.email}
            </p>
          </div>

          {/* Proxy Badge */}
          {proxy && (
            <span className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent rounded-md">
              {proxy.name}
            </span>
          )}

          {/* Type Badge */}
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-md",
              isParent
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {isParent ? "Motininis" : "Paprastas"}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onManageProxy(account);
              }}
              title="Valdyti proxy"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(account.credentials.email, "El. paštas");
              }}
              title="Kopijuoti el. paštą"
            >
              {copiedField === "El. paštas" ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(account.id);
              }}
              className="hover:text-destructive"
              title="Ištrinti"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Child Accounts */}
      {isExpanded &&
        childAccounts.map((child) => (
          <AccountCard
            key={child.id}
            account={child}
            onDelete={onDelete}
            onShowDetails={onShowDetails}
            onManageProxy={onManageProxy}
            onShowStatus={onShowStatus}
            depth={1}
          />
        ))}
    </div>
  );
}

import { StatusResponse } from "@/hooks/useAccountStatus";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";

interface StatusResponseModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  response: StatusResponse | null;
}

const formatJson = (value: unknown) =>
  value ? JSON.stringify(value, null, 2) : "Nėra duomenų";

export function StatusResponseModal({
  open,
  onClose,
  username,
  response,
}: StatusResponseModalProps) {
  const statusLabel = response ? String(response.status) : "—";
  const onlineLabel = response?.isOnline ? "Online" : "Offline";
  const timestamp = response?.timestamp
    ? new Date(response.timestamp).toLocaleString()
    : "—";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2">
            <span>Statuso atsakymas</span>
            <span className="text-sm text-muted-foreground">{username || "—"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={response?.isOnline ? "default" : "destructive"}>
              {onlineLabel}
            </Badge>
            <Badge variant="outline">HTTP {statusLabel}</Badge>
            <Badge variant="outline">{timestamp}</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Request URL</p>
            <p className="text-sm text-muted-foreground break-all">
              {response?.request.url ?? "—"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Request Headers</p>
            <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-40">
              {formatJson(response?.request.headers)}
            </pre>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Response</p>
            <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-64">
              {formatJson(response?.response)}
            </pre>
          </div>

          {response?.error && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-destructive">Klaida</p>
              <p className="text-sm text-destructive">{response.error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

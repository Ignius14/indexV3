import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  clickable?: boolean;
}

export function StatusIndicator({ isOnline, size = "md", onClick, clickable = false }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "rounded-full transition-transform",
        sizeClasses[size],
        isOnline ? "status-online" : "status-offline",
        clickable && "cursor-pointer hover:scale-125 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      )}
      title={isOnline ? "Prisijungęs (paspauskite detalėms)" : "Neprisijungęs (paspauskite detalėms)"}
    />
  );
}


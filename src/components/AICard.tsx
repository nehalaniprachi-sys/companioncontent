import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AICardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export function AICard({ title, icon, children, loading, className = "" }: AICardProps) {
  return (
    <div className={`glass-card rounded-2xl p-6 shadow-card animate-fade-in ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display font-semibold text-foreground">{title}</h3>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      </div>
      {children}
    </div>
  );
}

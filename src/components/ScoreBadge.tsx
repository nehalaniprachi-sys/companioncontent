interface ScoreBadgeProps {
  score: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ScoreBadge({ score, max = 100, size = "md", label }: ScoreBadgeProps) {
  const percentage = (score / max) * 100;
  const getColor = () => {
    if (percentage >= 80) return "text-accent";
    if (percentage >= 60) return "text-primary";
    if (percentage >= 40) return "text-yellow-500";
    return "text-destructive";
  };

  const sizes = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} rounded-full border-2 border-current flex items-center justify-center font-display font-bold ${getColor()}`}
      >
        {score}
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

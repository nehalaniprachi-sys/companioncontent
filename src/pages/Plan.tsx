import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { AICard } from "@/components/AICard";
import { callAI } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Loader2, Sparkles, RefreshCw, Clock, Flame } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CalendarDay {
  day: string;
  content_title: string;
  format: string;
  description: string;
  best_time: string;
  theme: string;
  effort_level: string;
}

const FREQUENCIES = ["Daily", "5 days/week", "3 days/week", "2 days/week"];

export default function Plan() {
  const { profile } = useCreatorProfile();
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [frequency, setFrequency] = useState("Daily");

  const generateCalendar = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await callAI("planning", {
        niche: profile.niche,
        platform: profile.platform,
        experience: profile.experience,
        goal: profile.goal,
        frequency,
      });
      if (Array.isArray(result)) {
        setCalendar(result);
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate calendar");
    } finally {
      setLoading(false);
    }
  };

  const getEffortColor = (level: string) => {
    const l = level?.toLowerCase();
    if (l === "low") return "bg-accent/10 text-accent";
    if (l === "medium") return "bg-primary/10 text-primary";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Content Planner
          </h1>
          <p className="text-muted-foreground mt-1">
            Get a personalized weekly content calendar from AI
          </p>
        </div>

        {/* Controls */}
        <AICard title="Calendar Settings" icon={<Sparkles className="w-5 h-5 text-primary" />}>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Posting Frequency
              </label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateCalendar}
              disabled={loading}
              className="gradient-primary text-primary-foreground shadow-glow px-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : calendar.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>
        </AICard>

        {/* Calendar */}
        {calendar.length > 0 && (
          <div className="space-y-3">
            {calendar.map((day, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-5 shadow-card hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Day label */}
                  <div className="w-20 shrink-0">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {day.day}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {day.content_title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {day.format}
                      </Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getEffortColor(day.effort_level)}`}>
                        {day.effort_level} effort
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{day.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {day.best_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {day.theme}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && calendar.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Plan your week with AI</p>
            <p className="text-sm mt-1">Generate a smart content calendar to stay consistent</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

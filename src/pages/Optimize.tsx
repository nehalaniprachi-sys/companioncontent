import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { AICard } from "@/components/AICard";
import { ScoreBadge } from "@/components/ScoreBadge";
import { callAI } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Loader2, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

interface OptimizationResult {
  overall_score: number;
  hook_score: number;
  hook_analysis: string;
  engagement_score: number;
  engagement_analysis: string;
  clarity_score: number;
  improvements: { tip: string; explanation: string }[];
  improved_hook: string;
  improved_cta: string;
}

const CONTENT_TYPES = ["Post/Caption", "Video Script", "Thread", "Newsletter", "Blog Post"];

export default function Optimize() {
  const { profile } = useCreatorProfile();
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast.error("Please paste your content to analyze");
      return;
    }
    setLoading(true);
    try {
      const res = await callAI("optimization", {
        content,
        contentType,
        platform: profile?.platform,
      });
      if (res && !res.raw) {
        setResult(res);
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Content Optimizer
          </h1>
          <p className="text-muted-foreground mt-1">
            Get AI-powered feedback and scores to improve your content
          </p>
        </div>

        {/* Input */}
        <AICard title="Submit Content" icon={<Sparkles className="w-5 h-5 text-primary" />}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Content Type</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue placeholder="Select content type..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Content</label>
              <Textarea
                placeholder="Paste your caption, script, or post here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-secondary border-border/50 min-h-[160px]"
              />
            </div>
            <Button
              onClick={analyzeContent}
              disabled={loading || !content.trim()}
              className="gradient-primary text-primary-foreground shadow-glow w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing content...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze & Score
                </>
              )}
            </Button>
          </div>
        </AICard>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Score Overview */}
            <AICard title="Content Score">
              <div className="flex items-center justify-center gap-8 py-4">
                <ScoreBadge score={result.overall_score} label="Overall" size="lg" />
                <ScoreBadge score={result.hook_score} max={10} label="Hook" />
                <ScoreBadge score={result.engagement_score} max={10} label="Engagement" />
                <ScoreBadge score={result.clarity_score} max={10} label="Clarity" />
              </div>
            </AICard>

            {/* Analysis */}
            <div className="grid md:grid-cols-2 gap-4">
              <AICard title="Hook Analysis">
                <p className="text-sm text-muted-foreground">{result.hook_analysis}</p>
              </AICard>
              <AICard title="Engagement Analysis">
                <p className="text-sm text-muted-foreground">{result.engagement_analysis}</p>
              </AICard>
            </div>

            {/* Improvements */}
            <AICard
              title="Actionable Improvements"
              icon={<ArrowUpRight className="w-5 h-5 text-accent" />}
            >
              <div className="space-y-4">
                {result.improvements?.map((imp, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                    <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{imp.tip}</p>
                      <p className="text-xs text-muted-foreground mt-1">{imp.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AICard>

            {/* Improved Versions */}
            <div className="grid md:grid-cols-2 gap-4">
              <AICard title="Improved Hook" icon={<CheckCircle2 className="w-4 h-4 text-accent" />}>
                <p className="text-sm text-foreground/90 bg-accent/5 border border-accent/20 p-4 rounded-xl">
                  {result.improved_hook}
                </p>
              </AICard>
              <AICard title="Improved CTA" icon={<CheckCircle2 className="w-4 h-4 text-accent" />}>
                <p className="text-sm text-foreground/90 bg-accent/5 border border-accent/20 p-4 rounded-xl">
                  {result.improved_cta}
                </p>
              </AICard>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="text-center py-16 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Ready to level up your content?</p>
            <p className="text-sm mt-1">Paste your content above and get instant AI feedback</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

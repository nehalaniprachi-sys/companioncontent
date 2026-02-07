import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { AICard } from "@/components/AICard";
import { callAI } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, Loader2, Sparkles, RefreshCw, Zap, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ContentIdea {
  title: string;
  format: string;
  description: string;
  reasoning: string;
  score: number;
}

export default function Ideas() {
  const { profile } = useCreatorProfile();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");

  const generateIdeas = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const result = await callAI("ideation", {
        niche: profile.niche,
        platform: profile.platform,
        experience: profile.experience,
        goal: profile.goal,
        topic: topic || undefined,
      });
      if (Array.isArray(result)) {
        setIdeas(result);
      } else if (result?.raw) {
        toast.error("Unexpected AI response format. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate ideas");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-accent";
    if (score >= 6) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Content Ideas
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-generated ideas personalized for your {profile?.niche} content on {profile?.platform}
          </p>
        </div>

        {/* Controls */}
        <AICard title="Generate Ideas" icon={<Sparkles className="w-5 h-5 text-primary" />}>
          <div className="flex gap-3">
            <Input
              placeholder="Optional: Enter a specific topic or trend..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-secondary border-border/50"
            />
            <Button
              onClick={generateIdeas}
              disabled={loading}
              className="gradient-primary text-primary-foreground shadow-glow shrink-0 px-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : ideas.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </AICard>

        {/* Ideas List */}
        {ideas.length > 0 && (
          <div className="space-y-4">
            {ideas.map((idea, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 shadow-card hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-semibold text-foreground text-lg">
                        {idea.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {idea.format}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <p className="text-xs text-accent/80">{idea.reasoning}</p>
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full border-2 border-current flex items-center justify-center font-display font-bold text-lg ${getScoreColor(idea.score)}`}
                    >
                      {idea.score}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">Score</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`);
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && ideas.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Ready to discover your next big idea?</p>
            <p className="text-sm mt-1">Click Generate to get personalized content ideas from AI</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

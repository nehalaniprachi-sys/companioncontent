import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { AICard } from "@/components/AICard";
import { callAI } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenTool, Loader2, Sparkles, Copy, Hash } from "lucide-react";
import { toast } from "sonner";

const TONES = [
  "Educational",
  "Casual & Fun",
  "Bold & Provocative",
  "Storytelling",
  "Inspirational",
  "Professional",
  "Humorous",
];

interface ContentResult {
  hooks: string[];
  outline: string;
  talking_points: string[];
  cta: string;
  hashtags: string[];
}

export default function Create() {
  const { profile } = useCreatorProfile();
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);

  const generateContent = async () => {
    if (!idea.trim() || !tone) {
      toast.error("Please enter an idea and select a tone");
      return;
    }
    setLoading(true);
    try {
      const res = await callAI("creation", {
        idea,
        tone,
        platform: profile?.platform,
        niche: profile?.niche,
      });
      if (res && !res.raw) {
        setResult(res);
      } else {
        toast.error("Unexpected response. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary" />
            Create Content
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate hooks, captions, and outlines powered by AI
          </p>
        </div>

        {/* Input Section */}
        <AICard title="Content Brief" icon={<Sparkles className="w-5 h-5 text-primary" />}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Content Idea</label>
              <Textarea
                placeholder="Describe your content idea... e.g., 'A reel about 5 mistakes beginner investors make'"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="bg-secondary border-border/50 min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tone & Style</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue placeholder="Choose your tone..." />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateContent}
              disabled={loading || !idea.trim() || !tone}
              className="gradient-primary text-primary-foreground shadow-glow w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </AICard>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Hooks */}
            <AICard title="Power Hooks" icon={<Sparkles className="w-5 h-5 text-accent" />}>
              <div className="space-y-3">
                {result.hooks?.map((hook, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 group"
                  >
                    <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground flex-1">{hook}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(hook, "Hook")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </AICard>

            {/* Outline */}
            <AICard title="Content Outline" icon={<PenTool className="w-5 h-5 text-primary" />}>
              <div className="relative">
                <div className="prose prose-sm prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90 bg-secondary/50 p-4 rounded-xl font-body">
                    {result.outline}
                  </pre>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(result.outline, "Outline")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </AICard>

            {/* Talking Points */}
            {result.talking_points && (
              <AICard title="Key Talking Points">
                <ul className="space-y-2">
                  {result.talking_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="text-primary mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </AICard>
            )}

            {/* CTA + Hashtags */}
            <div className="grid md:grid-cols-2 gap-4">
              <AICard title="Call to Action">
                <p className="text-sm text-foreground/90 bg-secondary/50 p-4 rounded-xl">
                  {result.cta}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => copyToClipboard(result.cta, "CTA")}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy CTA
                </Button>
              </AICard>
              <AICard title="Hashtags" icon={<Hash className="w-4 h-4 text-accent" />}>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium cursor-pointer hover:bg-accent/20 transition-colors"
                      onClick={() => copyToClipboard(tag, "Hashtag")}
                    >
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => copyToClipboard(result.hashtags?.join(" ") || "", "All hashtags")}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All
                </Button>
              </AICard>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="text-center py-16 text-muted-foreground">
            <PenTool className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Ready to create something amazing?</p>
            <p className="text-sm mt-1">Enter your content idea and let AI craft the perfect copy</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

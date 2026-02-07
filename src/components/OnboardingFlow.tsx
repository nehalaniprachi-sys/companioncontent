import { useState } from "react";
import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { callAI } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Zap, Target, Palette, Rocket } from "lucide-react";
import { toast } from "sonner";

const NICHES = [
  "Tech & Programming",
  "Fitness & Health",
  "Finance & Investing",
  "Travel & Lifestyle",
  "Food & Cooking",
  "Education & Learning",
  "Gaming",
  "Beauty & Fashion",
  "Business & Entrepreneurship",
  "Art & Design",
  "Music & Entertainment",
  "Science & Nature",
  "Other",
];

const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Twitter/X", "LinkedIn", "Blog/Newsletter"];
const EXPERIENCE = ["Beginner (0-6 months)", "Intermediate (6-24 months)", "Advanced (2+ years)", "Pro Creator"];
const GOALS = ["Grow followers", "Increase engagement", "Build authority", "Monetize content", "Build community", "Brand awareness"];

export function OnboardingFlow() {
  const { setProfile } = useCreatorProfile();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    niche: "",
    platform: "",
    experience: "",
    goal: "",
  });

  const steps = [
    {
      icon: Sparkles,
      title: "What's your name?",
      subtitle: "Let's personalize your experience",
      field: "displayName" as const,
    },
    {
      icon: Palette,
      title: "What's your niche?",
      subtitle: "This helps us tailor content ideas to your audience",
      field: "niche" as const,
    },
    {
      icon: Target,
      title: "Which platform?",
      subtitle: "We'll optimize recommendations for your main platform",
      field: "platform" as const,
    },
    {
      icon: Zap,
      title: "Your experience level?",
      subtitle: "So we can match the right strategies for you",
      field: "experience" as const,
    },
    {
      icon: Rocket,
      title: "What's your main goal?",
      subtitle: "We'll prioritize AI suggestions around this",
      field: "goal" as const,
    },
  ];

  const canProceed = form[steps[step].field]?.trim().length > 0;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const aiProfile = await callAI("profile", form);
      setProfile({ ...form, aiProfile });
      toast.success("Welcome aboard! Your AI copilot is ready. 🚀");
    } catch (err) {
      console.error(err);
      // Still set profile even if AI fails
      setProfile(form);
      toast.success("Profile created! AI insights will be available shortly.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Progress */}
        <div className="flex gap-2 mb-12 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "w-12 gradient-primary" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="animate-slide-up" key={step}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <StepIcon className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold font-display text-center mb-2">
            {currentStep.title}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {currentStep.subtitle}
          </p>

          {/* Input */}
          <div className="space-y-4">
            {currentStep.field === "displayName" ? (
              <Input
                placeholder="Enter your name..."
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="h-14 text-lg bg-secondary border-border/50 text-center font-display"
                autoFocus
              />
            ) : currentStep.field === "niche" ? (
              <Select value={form.niche} onValueChange={(v) => setForm({ ...form, niche: v })}>
                <SelectTrigger className="h-14 text-lg bg-secondary border-border/50">
                  <SelectValue placeholder="Choose your niche..." />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : currentStep.field === "platform" ? (
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, platform: p })}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.platform === p
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : currentStep.field === "experience" ? (
              <div className="grid gap-3">
                {EXPERIENCE.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm({ ...form, experience: e })}
                    className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      form.experience === e
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, goal: g })}
                    className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.goal === g
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="gradient-primary text-primary-foreground shadow-glow px-8"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!canProceed || loading}
                className="gradient-primary text-primary-foreground shadow-glow px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up AI...
                  </>
                ) : (
                  <>
                    Launch Copilot
                    <Rocket className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

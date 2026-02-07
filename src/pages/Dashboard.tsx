import { DashboardLayout } from "@/components/DashboardLayout";
import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { AICard } from "@/components/AICard";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  PenTool,
  BarChart3,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Generate Ideas",
    description: "Get AI-powered content ideas tailored to your niche",
    icon: Lightbulb,
    path: "/ideas",
    gradient: "gradient-primary",
  },
  {
    title: "Create Content",
    description: "Write hooks, captions, and outlines with AI",
    icon: PenTool,
    path: "/create",
    gradient: "gradient-accent",
  },
  {
    title: "Optimize Content",
    description: "Get feedback and scores on your content",
    icon: BarChart3,
    path: "/optimize",
    gradient: "gradient-primary",
  },
  {
    title: "Plan Calendar",
    description: "Generate a personalized weekly content plan",
    icon: CalendarDays,
    path: "/plan",
    gradient: "gradient-accent",
  },
];

export default function Dashboard() {
  const { profile } = useCreatorProfile();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
        {/* Welcome Hero */}
        <div className="glass-card rounded-2xl p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">AI Content Copilot</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back, {profile?.displayName} 👋
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Your AI copilot is ready to help you discover, create, optimize, and plan content
              for <span className="text-accent font-medium">{profile?.platform}</span> in the{" "}
              <span className="text-primary font-medium">{profile?.niche}</span> space.
            </p>
          </div>
        </div>

        {/* AI Profile Insights */}
        {profile?.aiProfile && (
          <AICard
            title="Your Creator DNA"
            icon={<Target className="w-5 h-5 text-accent" />}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-foreground font-medium mb-1">Creator Archetype</p>
                <p className="text-sm text-muted-foreground">{profile.aiProfile.archetype}</p>
              </div>
              <div>
                <p className="text-sm text-foreground font-medium mb-2">Content Pillars</p>
                <div className="flex flex-wrap gap-2">
                  {profile.aiProfile.content_pillars?.map((p, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-foreground font-medium mb-2">Strengths</p>
                <ul className="space-y-1">
                  {profile.aiProfile.strengths?.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <TrendingUp className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-foreground font-medium mb-2">Growth Opportunities</p>
                <ul className="space-y-1">
                  {profile.aiProfile.opportunities?.slice(0, 3).map((o, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AICard>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            What would you like to do?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="glass-card rounded-2xl p-6 text-left group hover:border-primary/30 transition-all duration-300 shadow-card"
              >
                <div className={`w-10 h-10 rounded-xl ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {action.description}
                </p>
                <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get started <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

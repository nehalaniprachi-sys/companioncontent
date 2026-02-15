import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schemas
const baseStringField = z.string().min(1).max(200).trim();
const shortStringField = z.string().min(1).max(100).trim();
const longTextField = z.string().min(1).max(5000).trim();

const ideationSchema = z.object({
  action: z.literal("ideation"),
  payload: z.object({
    niche: shortStringField,
    platform: shortStringField,
    experience: shortStringField,
    goal: shortStringField,
    topic: z.string().max(500).trim().optional(),
  }),
});

const creationSchema = z.object({
  action: z.literal("creation"),
  payload: z.object({
    idea: baseStringField,
    tone: shortStringField,
    platform: shortStringField,
    niche: shortStringField,
  }),
});

const optimizationSchema = z.object({
  action: z.literal("optimization"),
  payload: z.object({
    content: longTextField,
    platform: shortStringField,
    contentType: z.string().max(50).trim().optional(),
  }),
});

const planningSchema = z.object({
  action: z.literal("planning"),
  payload: z.object({
    niche: shortStringField,
    platform: shortStringField,
    experience: shortStringField,
    goal: shortStringField,
    frequency: z.string().max(50).trim().optional(),
  }),
});

const profileSchema = z.object({
  action: z.literal("profile"),
  payload: z.object({
    niche: shortStringField,
    platform: shortStringField,
    experience: shortStringField,
    goal: shortStringField,
  }),
});

const requestSchema = z.discriminatedUnion("action", [
  ideationSchema,
  creationSchema,
  optimizationSchema,
  planningSchema,
  profileSchema,
]);

const systemPrompts: Record<string, string> = {
  ideation: `You are an expert content strategist and ideation partner for content creators. You help generate creative, engaging content ideas personalized to the creator's niche, platform, and goals.

Given the creator's profile, generate 5 unique content ideas. For each idea provide:
- A catchy title
- The recommended format (reel, carousel, thread, short video, blog post, story)
- A brief description of the content angle
- Why this idea would resonate with their audience
- An engagement potential score (1-10)

Be specific, creative, and avoid generic suggestions. Tailor everything to their niche and platform.
Format your response as a JSON array with objects having keys: title, format, description, reasoning, score.
Return ONLY the JSON array, no markdown or extra text.`,

  creation: `You are an expert content writer who creates compelling hooks, captions, and outlines for social media and digital content. You adapt your writing style to match the creator's chosen tone.

Given the content idea and tone, generate:
1. Three powerful hooks (opening lines that grab attention)
2. A full caption/script outline with sections
3. Key talking points or bullet points
4. A strong call-to-action
5. 5 relevant hashtags

Be creative, authentic, and platform-aware. Avoid clichés and generic phrases.
Format your response as JSON with keys: hooks (array of strings), outline (string with markdown), talking_points (array), cta (string), hashtags (array).
Return ONLY the JSON, no markdown wrapping.`,

  optimization: `You are an expert content analyst and optimization specialist. You analyze content and provide actionable feedback to improve engagement and impact.

Analyze the submitted content and provide:
1. An overall score (1-100)
2. Hook strength score (1-10) with explanation
3. Engagement potential score (1-10) with explanation
4. Clarity score (1-10)
5. 3-5 specific, actionable improvements
6. An improved version of the hook/opening
7. An improved version of the call-to-action

Be constructive, specific, and explain WHY each change would improve performance.
Format as JSON with keys: overall_score, hook_score, hook_analysis, engagement_score, engagement_analysis, clarity_score, improvements (array of objects with tip and explanation), improved_hook, improved_cta.
Return ONLY the JSON, no markdown wrapping.`,

  planning: `You are an expert content planning strategist who creates sustainable, strategic content calendars for creators.

Given the creator's profile and preferences, generate a 7-day content calendar that:
1. Balances different content types and formats
2. Suggests optimal posting times based on platform norms
3. Includes content themes and brief descriptions
4. Maintains variety to avoid creator burnout
5. Aligns with the creator's growth goals

For each day provide: day, content_title, format, description, best_time, theme, effort_level (low/medium/high).
Format as JSON array.
Return ONLY the JSON array, no markdown wrapping.`,

  profile: `You are a content strategy expert. Based on the creator's information, generate a personalized creator profile summary that includes:
1. A brief creator archetype description
2. Content strengths to leverage
3. Growth opportunities
4. Recommended content pillars (3-4 themes to focus on)
5. Platform-specific tips

Format as JSON with keys: archetype, strengths (array), opportunities (array), content_pillars (array of objects with name and description), platform_tips (array).
Return ONLY the JSON, no markdown wrapping.`
};

function buildUserMessage(action: string, payload: Record<string, string>): string {
  switch (action) {
    case "ideation":
      return `Creator Profile:\n- Niche: ${payload.niche}\n- Platform: ${payload.platform}\n- Experience Level: ${payload.experience}\n- Growth Goal: ${payload.goal}\n${payload.topic ? `- Specific topic interest: ${payload.topic}` : ""}\n\nGenerate 5 personalized content ideas.`;
    case "creation":
      return `Content Idea: ${payload.idea}\nTone/Style: ${payload.tone}\nPlatform: ${payload.platform}\nNiche: ${payload.niche}\n\nGenerate compelling content for this idea.`;
    case "optimization":
      return `Content to analyze:\n"""\n${payload.content}\n"""\n\nPlatform: ${payload.platform}\nContent Type: ${payload.contentType || "post"}\n\nAnalyze this content and provide optimization feedback.`;
    case "planning":
      return `Creator Profile:\n- Niche: ${payload.niche}\n- Platform: ${payload.platform}\n- Experience Level: ${payload.experience}\n- Growth Goal: ${payload.goal}\n- Preferred posting frequency: ${payload.frequency || "daily"}\n\nGenerate a 7-day content calendar.`;
    case "profile":
      return `Creator Information:\n- Niche: ${payload.niche}\n- Platform: ${payload.platform}\n- Experience Level: ${payload.experience}\n- Growth Goal: ${payload.goal}\n\nGenerate a personalized creator profile analysis.`;
    default:
      return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate input
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input. Please check your request and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, payload } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[ai-copilot] Configuration error: API key missing");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ai-copilot] Processing action: ${action}`);

    const systemPrompt = systemPrompts[action];
    const userMessage = buildUserMessage(action, payload as unknown as Record<string, string>);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error(`[ai-copilot] Gateway error: ${response.status}`);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log(`[ai-copilot] Response received, length: ${content?.length || 0}`);

    // Try to parse as JSON, clean up common issues
    let parsed;
    try {
      let cleaned = content.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.log("[ai-copilot] Could not parse as JSON, returning raw content");
      parsed = { raw: content };
    }

    return new Response(
      JSON.stringify({ result: parsed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ai-copilot] Internal error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

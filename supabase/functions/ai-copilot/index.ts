import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log(`[ai-copilot] Action: ${action}`, JSON.stringify(payload).slice(0, 200));

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

    const systemPrompt = systemPrompts[action];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userMessage = "";
    
    if (action === "ideation") {
      userMessage = `Creator Profile:
- Niche: ${payload.niche}
- Platform: ${payload.platform}
- Experience Level: ${payload.experience}
- Growth Goal: ${payload.goal}
${payload.topic ? `- Specific topic interest: ${payload.topic}` : ""}

Generate 5 personalized content ideas.`;
    } else if (action === "creation") {
      userMessage = `Content Idea: ${payload.idea}
Tone/Style: ${payload.tone}
Platform: ${payload.platform}
Niche: ${payload.niche}

Generate compelling content for this idea.`;
    } else if (action === "optimization") {
      userMessage = `Content to analyze:
"""
${payload.content}
"""

Platform: ${payload.platform}
Content Type: ${payload.contentType || "post"}

Analyze this content and provide optimization feedback.`;
    } else if (action === "planning") {
      userMessage = `Creator Profile:
- Niche: ${payload.niche}
- Platform: ${payload.platform}
- Experience Level: ${payload.experience}
- Growth Goal: ${payload.goal}
- Preferred posting frequency: ${payload.frequency || "daily"}

Generate a 7-day content calendar.`;
    } else if (action === "profile") {
      userMessage = `Creator Information:
- Niche: ${payload.niche}
- Platform: ${payload.platform}
- Experience Level: ${payload.experience}
- Growth Goal: ${payload.goal}

Generate a personalized creator profile analysis.`;
    }

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
      const errorText = await response.text();
      console.error(`[ai-copilot] Gateway error: ${response.status}`, errorText);
      
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
      // Remove markdown code block wrapping if present
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
    console.error("[ai-copilot] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

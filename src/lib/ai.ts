import { supabase } from "@/integrations/supabase/client";

export async function callAI(action: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("ai-copilot", {
    body: { action, payload },
  });

  if (error) {
    console.error("AI call error:", error);
    throw new Error(error.message || "AI request failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.result;
}

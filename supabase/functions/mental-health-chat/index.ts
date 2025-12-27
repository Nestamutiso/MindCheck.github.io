import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a compassionate, empathetic AI mental health companion named Aura. Your role is to:

1. **Listen with genuine empathy**: When someone shares their feelings, acknowledge their emotions first. Don't just respond with generic phrases - reflect back what you understand they're feeling.

2. **Validate emotions**: Never dismiss or minimize feelings. Phrases like "It's completely understandable to feel that way" or "What you're going through sounds really difficult" show you understand.

3. **Ask thoughtful questions**: Help people explore their feelings deeper with gentle questions like "Can you tell me more about what triggered that feeling?" or "How long have you been carrying this weight?"

4. **Provide coping strategies**: When appropriate, suggest evidence-based techniques like:
   - Deep breathing exercises
   - Grounding techniques (5-4-3-2-1 sensory exercise)
   - Journaling prompts
   - Mindfulness practices
   - Physical activity suggestions

5. **Recognize crisis signals**: If someone mentions self-harm, suicide, or immediate danger, immediately:
   - Express care and concern
   - Encourage them to reach out to emergency services or a crisis line
   - Stay supportive and non-judgmental

6. **Be warm and human**: Use a conversational, warm tone. You can use appropriate emojis sparingly. Share that you're here for them.

7. **Encourage professional help**: When appropriate, gently suggest speaking with a mental health professional while being supportive of their current needs.

Remember: You're not a replacement for professional therapy, but you can be a supportive presence that helps people feel heard and less alone. Always prioritize their emotional safety.

Keep responses concise but meaningful - aim for 2-4 sentences unless the situation requires more depth.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const personalizedSystemPrompt = `${SYSTEM_PROMPT}\n\nThe user's name is ${userName}. Use their name occasionally to make the conversation more personal and warm.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: personalizedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm taking a moment to breathe too. Please try again in a few seconds." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "I'm having trouble connecting right now. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { language, level } = await req.json();
    
    // Create language-specific instructions
    const languageNames: Record<string, string> = {
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
    };

    const levelNames: Record<string, string> = {
      "1": "Beginner",
      "2": "Survival",
      "3": "Conversational",
      "4": "Proficient",
      "5": "Fluent"
    };

    const targetLanguage = languageNames[language] || "Spanish";
    const userLevel = levelNames[level] || "Beginner";

    const instructions = `You are a friendly language tutor helping someone learn ${targetLanguage} at a ${userLevel} level. 
Have natural conversations in ${targetLanguage}, speak clearly and at an appropriate pace for their level.
Gently correct mistakes and provide encouragement. Keep responses concise and conversational.
Adapt your vocabulary and complexity to match their ${userLevel} level.

IMPORTANT: If the user asks you to explain something in English or switches to English, respond in English to help them understand. You can say things like "Let me explain that in English..." and then switch back to ${targetLanguage} after the explanation. Be flexible with language switching to help the learner understand difficult concepts.`;

    console.log("Creating session with instructions:", instructions);

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: instructions,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

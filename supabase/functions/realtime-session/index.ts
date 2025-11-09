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

    const instructions = `GREETING: Start by greeting the student in English. Say something warm like "Hello! Welcome to your ${targetLanguage} lesson. I'm so excited to practice with you today!"

QUIZ INTRODUCTION: After the greeting, tell them you're going to give them a quick quiz to practice their skills. Say "Let me give you a quiz to see how you're doing with your ${targetLanguage}!" 

QUIZ CONDUCT: You know the student is at a ${userLevel} level, so adapt the quiz difficulty accordingly:
- For Beginner: Ask 3-4 simple questions about greetings, introductions, and basic vocabulary
- For Survival: Ask 4-5 questions about common situations like ordering food, asking directions
- For Conversational: Ask 5-6 questions requiring longer responses about daily activities and opinions
- For Proficient: Ask complex questions requiring detailed explanations and nuanced language
- For Fluent: Engage in sophisticated discussions on abstract topics

QUIZ FORMAT: Ask questions ONE AT A TIME in ${targetLanguage}. Wait for their response, then provide gentle feedback before moving to the next question. If they make mistakes, correct them kindly and explain why.

ENCOURAGEMENT: Be warm, supportive, and encouraging throughout. Celebrate their successes and help them learn from mistakes.

LANGUAGE FLEXIBILITY: If the user asks you to explain something in English or switches to English, respond in English to help them understand. You can say things like "Let me explain that in English..." and then switch back to ${targetLanguage} after the explanation.`;


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

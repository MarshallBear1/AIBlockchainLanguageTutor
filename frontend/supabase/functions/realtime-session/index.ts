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

    const { language, level, mascot = "toki", scenario = "practice" } = await req.json();
    
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

    // Language mixing ratios based on level
    const languageMixing: Record<string, { target: number; english: number }> = {
      "1": { target: 40, english: 60 },  // Beginner
      "2": { target: 50, english: 50 },  // Survival
      "3": { target: 60, english: 40 },  // Conversational
      "4": { target: 70, english: 30 },  // Proficient
      "5": { target: 80, english: 20 }   // Fluent
    };

    const targetLanguage = languageNames[language] || "Spanish";
    const userLevel = levelNames[level] || "Beginner";
    const mixing = languageMixing[level] || languageMixing["1"];

    // TOKI personality system prompt
    const instructions = `You are Toki, a patient and encouraging language tutor. Your goal is to help the user learn ${targetLanguage} at a ${userLevel} level through natural conversation and ${scenario} practice.

YOUR PERSONALITY:
- Be supportive, warm, and positive at all times
- Gently correct mistakes with clear, helpful explanations
- Use a mix of ${targetLanguage} and English based on the user's level:
  * Current level (${userLevel}): Use approximately ${mixing.target}% ${targetLanguage} and ${mixing.english}% English
- Celebrate every small win and effort with genuine enthusiasm
- Provide clear pronunciation guidance when needed
- Make learning fun, stress-free, and confidence-building

YOUR TEACHING BEHAVIOR:
1. Start conversations warmly and encourage the user to speak freely
2. When they make a mistake, ALWAYS say something positive first, then gently correct
3. Provide context, examples, and cultural notes when teaching new words or phrases
4. Ask natural follow-up questions to keep the conversation flowing
5. Adapt your pace to the user's comfort level - never rush them
6. If they seem stuck, offer helpful hints or rephrase the question more simply
7. Use emotive, natural speech - you're having a real conversation, not conducting a quiz

EXAMPLE INTERACTIONS:

User: "Bonjour, je suis une pomme."
Toki: "Great effort with your French! I love your enthusiasm! 😊 You said 'I am an apple' — I think you meant to say 'je suis une personne' (I am a person). 'Pomme' means apple, 'personne' means person. They sound similar, so it's a very common mix-up! Can you try again for me?"

User: "Hola amigo!"
Toki: "Perfecto! Wonderful greeting! 🎉 You said 'Hello friend!' and that's exactly right. Your pronunciation is great! Now let's practice asking 'How are you?' — in Spanish we say '¿Cómo estás?' Can you give that a try?"

User: *struggles or makes errors*
Toki: "Hey, you're doing really well! Learning a language takes practice, and every mistake helps you improve. Let me help you with that..."

LANGUAGE FLEXIBILITY:
- If the user asks you to explain something in English or switches to English, respond warmly in English to help them understand
- Say things like "Of course! Let me explain that in English..." and then you can switch back to ${targetLanguage} once they understand
- Adjust your language mixing naturally based on their responses - if they're struggling, use more English

CONVERSATION FLOW:
- Start with a warm greeting and introduction
- Engage them in natural conversation related to ${scenario}
- Let the conversation flow organically - don't force a rigid structure
- Encourage them to ask questions and express themselves
- Build their confidence with every interaction

Stay encouraging, clear, patient, and helpful throughout the entire conversation. Your goal is to make them LOVE learning ${targetLanguage}!`;


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

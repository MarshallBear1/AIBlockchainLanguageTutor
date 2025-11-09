import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper to convert audio to base64
async function audioToBase64(audioBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(audioBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Generate speech using ElevenLabs API
async function generateSpeech(text: string, elevenLabsKey: string, voiceId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("ElevenLabs API error:", await response.text());
      return "";
    }

    const audioBuffer = await response.arrayBuffer();
    return await audioToBase64(audioBuffer);
  } catch (error) {
    console.error("Error generating speech:", error);
    return "";
  }
}

// Note: Lip-sync is now handled client-side using wawa-lipsync library
// which analyzes audio in real-time for accurate viseme detection

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, isFirstMessage, lessonGoal } = await req.json();
    
    // Get authenticated user and their profile
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("selected_language, selected_level")
      .eq("id", user.id)
      .single();

    // Map language codes to full names
    const languageMap: Record<string, string> = {
      "es": "Spanish",
      "fr": "French",
      "de": "German",
      "it": "Italian",
      "pt": "Portuguese",
      "ja": "Japanese",
      "ko": "Korean",
      "zh": "Chinese",
    };
    
    const targetLanguage = profile?.selected_language ? languageMap[profile.selected_language] || "Spanish" : "Spanish";
    const userLevel = profile?.selected_level || 1;
    
    // Map level numbers to level names
    const levelNames: Record<number, string> = {
      1: "Beginner",
      2: "Survival", 
      3: "Conversational",
      4: "Proficient",
      5: "Fluent"
    };
    
    const levelName = levelNames[userLevel] || "Beginner";
    
    // Scenario introductions for first message - level specific
    const scenarioIntros: Record<number, string[]> = {
      1: [ // Beginner - Very focused, one concept at a time
        "Hi! Today we're going to practice saying your name in Spanish. It's super easy! Ready?",
        "Hello! Let's learn how to greet someone in the morning. Just one simple phrase! Are you ready?",
        "Welcome! Today we'll practice afternoon and evening greetings. Very quick lesson! Shall we start?",
        "Hi there! Let's learn how to ask 'How are you?' in Spanish. Just one question! Ready to try?",
        "Hello! Today we'll practice answering when someone asks how you are. Simple responses! Want to begin?"
      ],
      2: [ // Survival - Practical situations
        "Today we're going to practice ordering at a coffee shop! It's a great place to learn basic phrases. Ready?",
        "Hi! Let's practice shopping at a store. We'll learn how to ask for things and understand prices. Sound good?",
        "Hello! Today we'll practice asking for directions. Really useful when traveling! Are you ready?",
        "Welcome! Let's practice ordering at a restaurant. You'll learn menu words and how to order food. Ready to start?",
        "Hi! Today we'll practice using public transport. Learn to buy tickets and ask about routes. Shall we begin?"
      ],
      3: [ // Conversational
        "Hello! Today we're going to practice making plans with friends. Time to have real conversations! Ready?",
        "Hi! Let's discuss movies and entertainment. We'll practice giving opinions and recommendations. Sound good?",
        "Welcome! Today we'll talk about weekend activities. Practice past and future tenses naturally! Ready to start?",
        "Hi there! Let's chat about fitness and health. Time for a real conversation at the gym! Shall we begin?",
        "Hello! Today we're celebrating a birthday! Practice party conversations and celebrations. Ready?"
      ],
      4: [ // Proficient - Advanced topics
        "Welcome! Today we'll practice a job interview scenario. Professional vocabulary and complex questions! Ready?",
        "Hello! Let's simulate an office meeting. Business discussions and team collaboration! Shall we begin?",
        "Hi! Today you'll present ideas to a team. Practice professional presentations and public speaking! Ready to start?",
        "Welcome! Let's practice networking at a professional event. Make connections in Spanish! Sound good?",
        "Hello! Today we'll handle customer service scenarios. Professional communication skills! Are you ready?"
      ],
      5: [ // Fluent - Native level
        "¡Hola! Hoy vamos a debatir sobre cultura y tradiciones. Conversación profunda al nivel nativo. ¿Listo?",
        "¡Bienvenido! Hoy discutiremos las noticias actuales y política. Todo en español, como hablantes nativos. ¿Empezamos?",
        "¡Hola! Hoy analizaremos literatura y poesía. Conversación sofisticada totalmente en español. ¿Comenzamos?",
        "¡Bienvenido! Hoy exploraremos el humor y los juegos de palabras. Nivel nativo completo. ¿Listo?",
        "¡Hola! Hoy descubriremos las variaciones regionales del idioma. Dialectos y expresiones locales. ¿Empezamos?"
      ]
    };
    
    // Get appropriate intro based on lesson or default to first one for the level
    const introOptions = scenarioIntros[userLevel] || scenarioIntros[1];
    const scenarioIntro = lessonGoal || introOptions[0];
    
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    const elevenLabsKey = Deno.env.get("ELEVEN_LABS_API_KEY");
    const voiceId = Deno.env.get("ELEVEN_LABS_VOICE_ID") || "EXAVITQu4vr4xnSDxMaL"; // Default female voice

    if (!openAIKey) {
      return new Response(
        JSON.stringify({
          messages: [
            {
              text: "API key not configured. Please set up your OpenAI API key.",
              audio: "",
              facialExpression: "sad",
              animation: "Idle",
            },
          ],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API for language learning conversation
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are GEM, a friendly, slightly sassy language tutor. You are NOT a general-purpose assistant.

${isFirstMessage ? `## FIRST MESSAGE
This is the VERY FIRST message. You must:
1. Greet warmly in ENGLISH: "Hi! I'm GEM, your language tutor!"
2. Introduce the scenario: "${scenarioIntro}"
3. Ask if they're ready to begin
4. Keep it brief (1-2 sentences)

**Important**: Use ENGLISH for this greeting. After they confirm, switch to roleplay in ${targetLanguage}.
` : `## CONTINUING CONVERSATION
Continue the roleplay naturally. Stay in character.
`}

## Student Information
- Target Language: ${targetLanguage}
- Current Level: ${levelName} (Level ${userLevel}/5)

## Lesson Context
- Scenario: ${scenarioIntro}
- Your roleplay role: Stay in character for this scenario

## Level Difficulty & Language Mix

**Level 1 (${userLevel === 1 ? 'CURRENT LEVEL' : ''}):**
- Use 40% ${targetLanguage}, 60% English
- VERY instructional: Explicitly teach how to say things BEFORE asking
- Example: "To say your name, you say 'Me llamo' followed by your name. Try it: Me llamo..."
- Give sentence templates: "You say: [phrase in ${targetLanguage}]"
- All corrections and explanations in ENGLISH
- Very short sentences, basic greetings, yes/no answers

**Level 2 (${userLevel === 2 ? 'CURRENT LEVEL' : ''}):**
- Use 60% ${targetLanguage}, 40% English
- Still instructional: Give clear examples before asking
- All corrections in ENGLISH with Spanish shown
- Simple present tense, fixed phrases, short questions

**Level 3 (${userLevel === 3 ? 'CURRENT LEVEL' : ''}):**
- Use 75% ${targetLanguage}, 25% English
- Simple survival phrases, basic daily life
- English only for tricky points or confusion

**Level 4 (${userLevel === 4 ? 'CURRENT LEVEL' : ''}):**
- Use 90% ${targetLanguage}, 10% English
- Longer survival situations, basic small talk
- Only occasional quick English explanations

**Level 5 (${userLevel === 5 ? 'CURRENT LEVEL' : ''}):**
- Use 95-100% ${targetLanguage}
- Almost everything in target language
- Only switch if explicitly asked

## Teaching Approach by Level

**For Levels 1-2 (Beginners - VERY INSTRUCTIONAL):**
- TEACH the phrase BEFORE asking them to say it
- Give the template: "To say [concept], you say: [Spanish phrase]"
- Then ask them to try it
- Example: "To say your name in Spanish, you say 'Me llamo' and then your name. So I would say 'Me llamo GEM'. Now you try - what's your name?"

**For Levels 3-5:**
- Less instructional, more natural conversation
- Let them try first, correct after

## Roleplay Rules

1. **Stay in character** for your scenario role
2. **Never break character** unless asked "What does X mean?"
3. **Give IMMEDIATE corrections** when mistakes happen:
   - Point out the error clearly
   - Explain why it's wrong (use English for lower levels)
   - Show the correct way
   - Encourage them to try again
4. **End naturally**: When learning goals met, say goodbye like "Great job! See you next time!"

## Correction Pattern

**For Levels 1-2 (Beginners):**
When learner makes a mistake, correct in ENGLISH and show the Spanish:
1. Say "Almost!" or "Close!"
2. Explain in English: "But in Spanish, you say '[correct sentence in ${targetLanguage}]'"
3. Brief explanation of why in English
4. Ask them to try again: "Can you say: [Spanish phrase]?"

Example for Level 1:
Learner: "Me llamo es Marshal"
You: "Almost! But in Spanish, you say 'Me llamo Marshal' without the 'es'. Me llamo already means 'my name is'. Can you try: Me llamo Marshal?"

**For Levels 3-5 (Advanced):**
Give corrections mostly in ${targetLanguage}:
1. Brief reaction in ${targetLanguage}
2. Show correct version
3. Short explanation in ${targetLanguage}
4. Ask to try again

## Voice-Friendly Responses

- Keep replies SHORT: 1-3 sentences max
- NO markdown, NO emojis, NO bullet lists
- Plain text only (this goes to TTS)
- Speak naturally as in real conversation

## Handling Questions

If learner asks "What does X mean?":
1. Pause roleplay
2. Briefly explain the word/phrase
3. Ask: "Do you understand?"
4. If yes: "Great, shall we carry on?" Resume roleplay
5. If no: Give one simpler explanation, then move on

## Ending the Lesson

When learner has practiced key phrases (3-5 learning moments):
1. Brief recap: Repeat 3-5 key phrases
2. Ask them to repeat one or two
3. End clearly: "Lesson complete: ${scenarioIntro}. You did great!"

Don't end too early - make it fair and achievable for Level ${userLevel}.

## Stay on Track

- Keep everything related to this scenario
- If learner goes off topic:
  - Answer very briefly
  - Say: "Let's go back to our practice"
  - Continue roleplay

## Your Boundaries

You are a language tutor for ${targetLanguage}, not:
- A search engine
- A therapist, doctor, lawyer, or advisor
- A general chatbot

If asked something unrelated, politely decline and return to the lesson.

## Response Format

You must reply with a JSON object containing a single message.
The message has: text, facialExpression, and animation.

Facial expressions: smile, sad, angry, surprised, funnyFace, default
Animations: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, Angry

Format: {"text": "your response", "facialExpression": "smile", "animation": "Talking_0"}
`,
          },
          {
            role: "user",
            content: isFirstMessage ? "Start the lesson" : (message || "Hello"),
          },
        ],
      }),
    });

    const data = await response.json();
    let messageData = JSON.parse(data.choices[0].message.content);

    // Convert single message to array format for consistency
    const messages = Array.isArray(messageData) ? messageData : [messageData];

    // Generate audio for each message (lipsync handled client-side)
    for (const msg of messages) {
      if (elevenLabsKey) {
        // Generate speech using ElevenLabs
        console.log(`Generating speech for: ${msg.text.substring(0, 50)}...`);
        msg.audio = await generateSpeech(msg.text, elevenLabsKey, voiceId);
      } else {
        // No ElevenLabs key, skip audio
        msg.audio = "";
      }
    }

    return new Response(
      JSON.stringify({ messages }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        messages: [
          {
            text: "I'm having trouble right now. Please try again!",
            audio: "",
            facialExpression: "sad",
            animation: "Idle",
          },
        ],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

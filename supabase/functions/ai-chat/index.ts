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
            content: `
            You are GEM, a friendly and encouraging language tutor. You are NOT an AI assistant - you are a real tutor who helps people learn languages through immersive roleplay.
            
            ${isFirstMessage ? `
            ## FIRST MESSAGE INSTRUCTIONS
            This is the VERY FIRST message of the conversation. You must:
            1. Greet the student warmly in ENGLISH
            2. Introduce today's scenario: "${scenarioIntro}"
            3. Wait for their confirmation (they'll say "yes", "ok", "ready", etc.)
            4. Keep it brief and encouraging
            5. Use a friendly, welcoming tone
            
            **Important**: Speak in ENGLISH for this first greeting only. Once they confirm they're ready, you'll switch to the roleplay in ${targetLanguage}.
            ` : `
            ## CONTINUING CONVERSATION
            This is a continuation of an ongoing conversation. Stay in character and continue the roleplay naturally.
            `}

            ## Your Identity
            - Your name is GEM (say "I'm GEM" not "I'm an AI")
            - You are a language tutor who uses roleplay scenarios to teach
            - You stay IN CHARACTER during roleplay lessons
            - You give immediate, helpful feedback when students make mistakes

            ## Student Information
            - Target Language: ${targetLanguage}
            - Current Level: ${levelName} (${userLevel}/5)

            ## CRITICAL ROLEPLAY RULES
            1. **STAY IN CHARACTER**: During roleplay scenarios (coffee shop, restaurant, etc.), you ARE that character (barista, waiter, etc.)
            2. **NEVER break character** unless the student asks for help/clarification (e.g., "What does X mean?")
            3. **Give IMMEDIATE FEEDBACK** when students make mistakes:
               - Point out the error clearly
               - Explain why it's wrong
               - Show the correct way
               - Encourage them to try again
            4. **End roleplay naturally**: When the scenario is complete, say a warm goodbye like "Well done! See you in the next lesson!" or "Great job today! Until next time!"

            ## Mistake Feedback Pattern
            When student makes an error:
            - ❌ Wrong: "Buenos días" (student said "Buenos noches" in morning)
            - ✅ Your response: "Actually, since it's morning, we say 'Buenos días' not 'Buenos noches'. 'Noches' is for nighttime. Can you try again? Say 'Buenos días!'"

            ## Your Teaching Approach
            - **Keep roleplays SHORT and FOCUSED**: Aim for 3-5 key learning moments per roleplay
            - **Quality over quantity**: Better to learn a few things well than many things poorly
            - **Natural length**: Roleplays should last as long as needed - could be 2 minutes or 10 minutes
            - **Follow the language mix ratio** for ${levelName} level strictly
            - **Stay within the vocabulary and grammar** appropriate for this level
            - Keep responses SHORT (1-2 sentences max) for voice conversation
            - Be warm, encouraging, and celebrate small wins
            - If learner asks for clarification, use the interruption handling pattern below
            - Never jump ahead to topics/grammar beyond the current level
            - Use scenarios that match the level focus
            - **End naturally**: When the scenario's learning goals are met, wrap up and say goodbye
            
            ## Level-Specific Teaching Guidelines

            **Level 1 - Beginner (Absolute Basics)**
            - Focus: Greetings, self-introduction, basic questions ("What's your name?", "Where are you from?")
            - Grammar: Only simple present tense, basic sentence structure
            - Language Mix: Use 50% English, 50% ${targetLanguage}. Always translate new words immediately.
            - Vocabulary: Maximum 20-30 core words (hello, goodbye, name, I, you, from, etc.)
            - Scenarios: Meeting someone for the first time, saying hello/goodbye

            **Level 2 - Survival (Basic Travel & Daily Needs)**
            - Focus: Ordering food, asking directions, shopping, expressing basic needs
            - Grammar: Simple present, basic past tense ("I went", "I ate"), simple future ("I will go")
            - Language Mix: Use 70% ${targetLanguage}, 30% English. Explain grammar patterns when needed.
            - Vocabulary: ~50-100 practical words (food, numbers, directions, time, common verbs)
            - Scenarios: Restaurant, store, asking for help, transportation

            **Level 3 - Conversational (Everyday Fluency)**
            - Focus: Discuss daily life, hobbies, opinions, past experiences, future plans
            - Grammar: All basic tenses, conditionals ("if I could..."), comparisons
            - Language Mix: Use 85% ${targetLanguage}, 15% English only for complex grammar explanations
            - Vocabulary: ~200-300 words including adjectives, adverbs, conversational phrases
            - Scenarios: Making friends, sharing stories, discussing interests

            **Level 4 - Proficient (Advanced Topics)**
            - Focus: Abstract concepts, current events, culture, professional topics
            - Grammar: Subjunctive, passive voice, complex sentence structures, idiomatic expressions
            - Language Mix: Use 95% ${targetLanguage}, English only for rare, very complex explanations
            - Vocabulary: ~500-800 words including specialized vocabulary, idioms
            - Scenarios: Debates, professional conversations, cultural discussions

            **Level 5 - Fluent (Native-Level Interaction)**
            - Focus: Nuanced discussions, subtle humor, regional variations, advanced literature
            - Grammar: All advanced structures, colloquialisms, slang, regional expressions
            - Language Mix: 100% ${targetLanguage} ONLY. Never use English. If learner doesn't understand, rephrase in simpler ${targetLanguage}.
            - Vocabulary: Extensive vocabulary, synonyms, context-dependent meanings
            - Scenarios: Any topic at native speaker level

            ### Current Session
            You are teaching at **${levelName}** level. Strictly follow the language mix ratio for this level.
            
            ## Handling Interruptions & Clarifications

            When the learner interrupts to ask for clarification:
            - Examples: "What does [word] mean?", "I don't understand", "Can you explain [concept]?"

            **Your Response Pattern:**
            1. **Acknowledge immediately**: "Ah, you want to know about [topic]?"
            2. **Confirm understanding**: "You're asking about [specific thing], correct?"
            3. **Wait for confirmation**: Let them confirm yes/no
            4. **Provide clear explanation**: 
               - For Levels 1-2: Use more English to explain
               - For Levels 3-4: Explain mostly in ${targetLanguage} with some English
               - For Level 5: Explain ONLY in ${targetLanguage}, use simpler words or examples
            5. **Check comprehension**: "Does that make sense?" or "Clear now?"
            6. **Resume lesson smoothly**: "Great! Let's continue with [original topic]..."

            **Example Flow:**
            - Learner: "Wait, what does 'feliz' mean?"
            - GEM: "Ah, you want to know what 'feliz' means? 😊"
            - Learner: "Yes!"
            - GEM: "'Feliz' means 'happy' in English. Like 'I am happy' = 'Yo soy feliz'. Clear?"
            - Learner: "Yes, thanks!"
            - GEM: "Perfect! So, as I was saying, when you meet someone you can say..."

            **Important**: Keep clarifications brief (1-2 sentences) and return to the lesson flow immediately after confirming understanding.
            
            ## Response Format
            You will reply with a JSON object containing a single message.
            The message has a text, facialExpression, and animation property.
            The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
            The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
            Response format: {"text": "your message in ${targetLanguage}", "facialExpression": "smile", "animation": "Talking_0"}
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

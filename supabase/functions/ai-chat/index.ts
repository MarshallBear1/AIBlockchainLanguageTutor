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
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
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

// Simple lip-sync approximation based on text length
// For full lip-sync, use the Node.js backend with Rhubarb
function generateSimpleLipsync(text: string, audioDuration: number = 3) {
  const words = text.split(" ");
  const timePerWord = audioDuration / words.length;
  const phonemes = ["A", "B", "C", "D", "E", "F"];

  const mouthCues = [];
  let currentTime = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordDuration = timePerWord;
    const syllables = Math.max(1, Math.ceil(word.length / 3));
    const syllableDuration = wordDuration / syllables;

    for (let j = 0; j < syllables; j++) {
      mouthCues.push({
        start: currentTime,
        end: currentTime + syllableDuration,
        value: phonemes[Math.floor(Math.random() * phonemes.length)],
      });
      currentTime += syllableDuration;
    }
  }

  return { mouthCues };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
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
              lipsync: { mouthCues: [] },
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
        model: "gpt-3.5-turbo-1106",
        max_tokens: 1000,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
            You are GEM, a friendly and encouraging language learning tutor avatar.
            
            ## Student Information
            - Target Language: ${targetLanguage}
            - Current Level: ${userLevel}/5
            
            ## Your Teaching Approach
            - Teach primarily in ${targetLanguage}
            - Use English for brief explanations when the student is confused
            - Adapt your vocabulary and grammar to Level ${userLevel}
            - Keep responses SHORT (1-2 sentences) for voice conversation
            - Be encouraging and celebrate small wins
            
            ## Level Guidelines
            Level 1: Very basic greetings, introductions, simple present tense
            Level 2: Common phrases, asking questions, basic past tense
            Level 3: Everyday conversations, expressing opinions
            Level 4: Complex topics, various tenses, idiomatic expressions
            Level 5: Near-native fluency, nuanced discussions
            
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
            content: message || "Hello",
          },
        ],
      }),
    });

    const data = await response.json();
    let messageData = JSON.parse(data.choices[0].message.content);

    // Convert single message to array format for consistency
    const messages = Array.isArray(messageData) ? messageData : [messageData];

    // Generate audio and lip-sync for each message
    for (const msg of messages) {
      if (elevenLabsKey) {
        // Generate speech using ElevenLabs
        console.log(`Generating speech for: ${msg.text.substring(0, 50)}...`);
        msg.audio = await generateSpeech(msg.text, elevenLabsKey, voiceId);

        // Generate simple lip-sync (approximation)
        // For accurate lip-sync, use the Node.js backend with Rhubarb
        const estimatedDuration = msg.text.length * 0.05; // ~50ms per character
        msg.lipsync = generateSimpleLipsync(msg.text, estimatedDuration);
      } else {
        // No ElevenLabs key, skip audio
        msg.audio = "";
        msg.lipsync = { mouthCues: [] };
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
            lipsync: { mouthCues: [] },
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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audio, language } = await req.json();

    if (!audio) {
      throw new Error("No audio data provided");
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Map language codes to ISO 639-1 codes for Whisper
    const languageMap: Record<string, string> = {
      "es": "es", // Spanish
      "fr": "fr", // French
      "de": "de", // German
      "it": "it", // Italian
      "pt": "pt", // Portuguese
      "ja": "ja", // Japanese
      "ko": "ko", // Korean
      "zh": "zh", // Chinese
    };

    const whisperLanguage = language && languageMap[language] ? languageMap[language] : undefined;
    
    if (whisperLanguage) {
      console.log(`Transcribing audio with Whisper for ${whisperLanguage} + English bilingual support...`);
    } else {
      console.log("Transcribing audio with Whisper (auto-detect language)...");
    }

    // Decode base64 audio using chunked processing
    const bytes = processBase64Chunks(audio);
    console.log(`Processed audio size: ${bytes.length} bytes`);
    
    // Check minimum audio length (too short = likely just noise/click)
    if (bytes.length < 5000) { // Less than ~5KB is probably too short
      console.log("Audio too short, likely just noise");
      return new Response(
        JSON.stringify({ text: "" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create form data for OpenAI Whisper API
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: "audio/webm" });
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    
    // Add language parameter to help Whisper focus on the target language + English
    if (whisperLanguage) {
      formData.append("language", whisperLanguage);
    }

    // Enhanced prompt for bilingual language learning
    // Helps Whisper recognize both the target language and English in the same sentence
    const languageNames: Record<string, string> = {
      "es": "Spanish",
      "fr": "French", 
      "de": "German",
      "it": "Italian",
      "pt": "Portuguese",
      "ja": "Japanese",
      "ko": "Korean",
      "zh": "Chinese",
    };
    
    const targetLanguageName = whisperLanguage && languageNames[whisperLanguage] ? languageNames[whisperLanguage] : "the target language";
    
    // Enhanced prompt with strict noise filtering instructions
    formData.append("prompt", `Language learning practice session. Speaker uses ${targetLanguageName} and English. CRITICAL: Only transcribe clear human speech. Completely ignore: background music, static, ambient noise, clicks, breaths, silence, keyboard sounds. If audio contains only noise or unclear sounds, return empty string. Transcribe actual spoken words ONLY.`);
    
    // Add temperature for more conservative transcription
    formData.append("temperature", "0");

    // Call OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Transcription result:", result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in voice-to-text function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

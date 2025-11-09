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

    // Use Whisper's auto-detect for better mixed-language handling
    // This works better for language learning where users mix target language + English
    console.log("Transcribing audio with Whisper (auto-detect for code-switching)...");

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
    // Using a focused prompt that helps Whisper understand context
    const promptText = `${targetLanguageName} language learning. Clear speech only. Student practicing pronunciation. Ignore background noise, music, silence.`;
    formData.append("prompt", promptText);
    
    // Temperature 0 = most deterministic, least hallucination
    formData.append("temperature", "0");
    
    // Response format - simple text is most reliable
    formData.append("response_format", "text");

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
    let transcribedText = result.text || "";
    
    console.log("Raw transcription result:", transcribedText);
    
    // Post-processing: Filter out common noise/hallucination patterns
    const noisePatterns = [
      // Common YouTube/video artifacts
      /thank you/gi,
      /thanks for watching/gi,
      /subscribe/gi,
      /like and subscribe/gi,
      /click the bell/gi,
      
      // Empty/minimal content
      /^\s*$/,  // Empty or whitespace only
      /^\.+$/,  // Just dots
      /^[,\.\!\?]+$/,  // Just punctuation
      /^\[.*\]$/,  // Bracketed text (often subtitle artifacts)
      /^\(.*\)$/,  // Parenthesized text
      
      // Common single-word noise
      /^(you|okay|um+|uh+|ah+|er+|hmm+)$/gi,
      
      // Music/sound effect artifacts
      /\[music\]/gi,
      /\[applause\]/gi,
      /\[laughter\]/gi,
      
      // Silence indicators
      /^\.\.\.$/, // Just "..."
      /^silence$/gi,
      
      // Non-speech sounds
      /^(cough|sigh|breath|click)$/gi,
    ];
    
    // Check if transcription matches any noise pattern
    for (const pattern of noisePatterns) {
      if (pattern.test(transcribedText.trim())) {
        console.log("Filtered out noise pattern:", transcribedText);
        transcribedText = "";
        break;
      }
    }
    
    // Additional validation checks
    const trimmed = transcribedText.trim();
    
    // Too short - likely noise
    if (trimmed.length > 0 && trimmed.length < 2) {
      console.log("Transcription too short (< 2 chars), filtering out:", transcribedText);
      transcribedText = "";
    }
    
    // Check if it's mostly non-alphabetic (numbers, symbols, etc.)
    const alphabeticChars = trimmed.replace(/[^a-zA-Z]/g, '').length;
    if (trimmed.length > 0 && alphabeticChars < trimmed.length * 0.3) {
      console.log("Transcription has too few letters, filtering out:", transcribedText);
      transcribedText = "";
    }
    
    // Check for repetitive characters (e.g., "aaaaaa")
    if (trimmed.length > 0 && /(.)\1{4,}/.test(trimmed)) {
      console.log("Transcription has repetitive characters, filtering out:", transcribedText);
      transcribedText = "";
    }
    
    console.log("Final transcription:", transcribedText);

    return new Response(
      JSON.stringify({ text: transcribedText }),
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

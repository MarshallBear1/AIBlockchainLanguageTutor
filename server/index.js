import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Default female voice

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Toki Speak Lip-sync Server is running!");
});

app.get("/voices", async (req, res) => {
  if (!elevenLabsApiKey) {
    return res.status(400).json({ error: "ElevenLabs API key not configured" });
  }
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);

  // Convert MP3 to WAV using ffmpeg
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);

  // Generate lip-sync data using Rhubarb
  // Make sure to download Rhubarb and place the binary in ./bin/
  // Windows: rhubarb.exe, Mac: rhubarb, Linux: rhubarb
  const rhubarbBinary = process.platform === "win32" ? "./bin/rhubarb.exe" : "./bin/rhubarb";

  await execCommand(
    `${rhubarbBinary} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!elevenLabsApiKey || openai.apiKey === "-") {
    return res.status(400).json({
      error: "API keys not configured",
      messages: [
        {
          text: "Please configure your OpenAI and ElevenLabs API keys.",
          audio: "",
          lipsync: { mouthCues: [] },
          facialExpression: "sad",
          animation: "Idle",
        },
      ],
    });
  }

  try {
    // Call OpenAI for language learning conversation
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
          You are a friendly and encouraging language learning tutor avatar.
          You will always reply with a JSON array of messages. With a maximum of 3 messages.
          Each message has a text, facialExpression, and animation property.
          The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
          Use ONLY these animations: Idle (for 95% of responses), Rumba (only for "Great job today!"). Keep the avatar calm and still. NEVER use Talking_0, Talking_1, Talking_2, Laughing, Crying, Terrified, or Angry - they are too dramatic.
          Keep your responses encouraging and helpful for language learning.
          Provide corrections gently and celebrate progress.
          `,
        },
        {
          role: "user",
          content: userMessage || "Hello",
        },
      ],
    });

    let messages = JSON.parse(completion.choices[0].message.content);

    // ChatGPT sometimes wraps it in a messages property
    if (messages.messages) {
      messages = messages.messages;
    }

    // Generate audio and lip-sync for each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Generate audio file with ElevenLabs
      const fileName = `audios/message_${i}.mp3`;
      const textInput = message.text;

      console.log(`Generating audio for message ${i}: ${textInput.substring(0, 50)}...`);
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);

      // Generate lip-sync with Rhubarb
      await lipSyncMessage(i);

      // Read and encode audio as base64
      message.audio = await audioFileToBase64(fileName);

      // Read lip-sync JSON
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: error.message,
      messages: [
        {
          text: "I'm having trouble right now. Please try again!",
          audio: "",
          lipsync: { mouthCues: [] },
          facialExpression: "sad",
          animation: "Idle",
        },
      ],
    });
  }
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Toki Speak Lip-sync Server listening on port ${port}`);
  console.log(`Make sure you have:`);
  console.log(`  - ffmpeg installed and in PATH`);
  console.log(`  - Rhubarb binary in ./bin/ directory`);
  console.log(`  - API keys configured in .env file`);
});

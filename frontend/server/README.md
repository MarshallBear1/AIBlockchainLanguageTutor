# Toki Speak Lip-sync Server

Optional Node.js server for **accurate lip-sync** using Rhubarb. This server provides precise mouth movement synchronization with the avatar's speech.

## When to Use This Server

- **Use Supabase Edge Function**: For basic functionality with simple lip-sync approximation (recommended for most users)
- **Use this Node.js server**: When you need **precise lip-sync** with accurate phoneme timing

## Prerequisites

1. **Node.js** (v18 or higher)
2. **ffmpeg** - For audio format conversion
   - Windows: Download from https://ffmpeg.org/download.html
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
3. **Rhubarb Lip Sync** - For accurate phoneme detection
   - Download from: https://github.com/DanielSWolf/rhubarb-lip-sync/releases
   - Extract the binary and place it in `server/bin/`
     - Windows: `server/bin/rhubarb.exe`
     - Mac/Linux: `server/bin/rhubarb`

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=sk-...
   ELEVEN_LABS_API_KEY=...
   ELEVEN_LABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
   ```

3. **Download Rhubarb:**
   - Go to: https://github.com/DanielSWolf/rhubarb-lip-sync/releases
   - Download the latest version for your OS
   - Extract and place the binary in `server/bin/`
   - Make it executable (Mac/Linux): `chmod +x bin/rhubarb`

4. **Verify ffmpeg is installed:**
   ```bash
   ffmpeg -version
   ```

## Running the Server

```bash
npm start
```

The server will run on http://localhost:3000

For development with auto-reload:
```bash
npm run dev
```

## Using with Toki Speak Studio

### Option 1: Use with Frontend (Development)

Update your frontend to call this server instead of the Supabase Edge Function:

In `src/hooks/useAvatarChat.tsx`, change the backend URL:
```typescript
const backendUrl = "http://localhost:3000";

const chat = async (userMessage: string) => {
  const response = await fetch(`${backendUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });
  const data = await response.json();
  setMessages((prev) => [...prev, ...data.messages]);
};
```

### Option 2: Deploy as Backend Service

Deploy this server to:
- **Heroku**
- **Railway**
- **Render**
- **DigitalOcean**
- Any Node.js hosting platform

Then update the `backendUrl` in your app to point to the deployed URL.

## API Endpoints

### `GET /`
Health check endpoint

### `GET /voices`
Get list of available ElevenLabs voices

### `POST /chat`
Generate AI conversation with audio and lip-sync

**Request:**
```json
{
  "message": "Hello, how do I say 'good morning' in Spanish?"
}
```

**Response:**
```json
{
  "messages": [
    {
      "text": "Great question! In Spanish, you say 'Buenos días'",
      "audio": "base64_encoded_audio",
      "lipsync": {
        "mouthCues": [
          { "start": 0.0, "end": 0.15, "value": "B" },
          { "start": 0.15, "end": 0.30, "value": "E" }
        ]
      },
      "facialExpression": "smile",
      "animation": "Talking_1"
    }
  ]
}
```

## Troubleshooting

### ffmpeg not found
Make sure ffmpeg is installed and in your system PATH

### Rhubarb not found
Verify the Rhubarb binary is in `server/bin/` and has execute permissions

### Audio generation fails
Check your ElevenLabs API key and ensure you have credits

### Slow response times
- Lip-sync generation can take a few seconds per message
- Consider caching responses for common phrases
- Use the Supabase Edge Function for faster (but less accurate) lip-sync

## Voice Configuration

To use a different voice:

1. List available voices:
   ```bash
   curl http://localhost:3000/voices
   ```

2. Copy the voice ID you want to use

3. Update `.env`:
   ```
   ELEVEN_LABS_VOICE_ID=your_chosen_voice_id
   ```

## Recommended Voices for Language Learning

- **Rachel** - Clear, patient female voice
- **Adam** - Clear male voice
- **Antoni** - Friendly male voice
- **Bella** - Soft female voice

Get voice IDs from: https://api.elevenlabs.io/v1/voices

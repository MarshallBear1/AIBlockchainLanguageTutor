# 3D Avatar Setup Guide

This guide explains how to set up the 3D avatars with voice and lip-sync in Toki Speak Studio.

## Architecture Overview

The avatar system has two backend options:

1. **Supabase Edge Function** (Recommended) - Serverless, simple lip-sync
2. **Node.js Server** (Optional) - For precise lip-sync with Rhubarb

## Quick Start (Edge Function)

### 1. Get API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)

#### ElevenLabs API Key (Optional for voice)
1. Go to https://elevenlabs.io/
2. Sign up for an account
3. Go to Profile → API Keys
4. Copy your API key

### 2. Configure Supabase Edge Function

Set the environment variables in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set OPENAI_API_KEY=sk-your-key-here
supabase secrets set ELEVEN_LABS_API_KEY=your-elevenlabs-key
supabase secrets set ELEVEN_LABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

Or through the Supabase Dashboard:
1. Go to Project Settings → Edge Functions → Secrets
2. Add the secrets:
   - `OPENAI_API_KEY`
   - `ELEVEN_LABS_API_KEY` (optional)
   - `ELEVEN_LABS_VOICE_ID` (optional)

### 3. Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy ai-chat
```

### 4. Test the Integration

Run your app:
```bash
npm run dev
```

Navigate through the onboarding flow and test the conversation feature!

## Advanced Setup (Node.js Server with Rhubarb)

For **accurate lip-sync**, see [server/README.md](server/README.md)

This option provides:
- Precise phoneme detection
- Frame-accurate mouth movements
- Professional-quality lip-sync

Requirements:
- ffmpeg
- Rhubarb Lip Sync binary
- Node.js server hosting

## Environment Variables Reference

### Supabase Edge Function

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for conversations | `sk-...` |
| `ELEVEN_LABS_API_KEY` | No* | ElevenLabs API key for TTS | `...` |
| `ELEVEN_LABS_VOICE_ID` | No | Voice ID for the avatar | `EXAVITQu4vr4xnSDxMaL` |

*Without ElevenLabs, avatars will have text responses but no voice

### Node.js Server (Optional)

See `server/.env.example` for Node.js server configuration

## Features Comparison

| Feature | Edge Function | Node.js + Rhubarb |
|---------|---------------|-------------------|
| **Setup Difficulty** | Easy | Moderate |
| **Cost** | Low | Variable |
| **Lip-sync Quality** | Approximate | Precise |
| **Response Time** | Fast (~2-3s) | Slower (~5-10s) |
| **Voice Support** | Yes | Yes |
| **Deployment** | Serverless | Requires hosting |

## Choosing Available Voices

### List ElevenLabs Voices

**Using curl:**
```bash
curl -X GET "https://api.elevenlabs.io/v1/voices" \
  -H "xi-api-key: YOUR_API_KEY"
```

**Using the Node.js server:**
```bash
curl http://localhost:3000/voices
```

### Popular Voice IDs

- **Rachel** (Female, clear): `21m00Tcm4TlvDq8ikWAM`
- **Domi** (Female, strong): `AZnzlk1XvdvUeBnXmlld`
- **Bella** (Female, soft): `EXAVITQu4vr4xnSDxMaL`
- **Antoni** (Male, friendly): `ErXwobaYiN019PkySvjV`
- **Elli** (Female, emotional): `MF3mGyEYCl7XYWbV9V6O`
- **Josh** (Male, deep): `TxGEqnHWrfWFTfGW9XjX`
- **Arnold** (Male, crisp): `VR6AewLTigWG4xSOukaG`
- **Adam** (Male, deep): `pNInz6obpgDQGcFmaJgB`
- **Sam** (Male, raspy): `yoZ06aMxZJJ28mfd3POQ`

## Customizing the Avatar

### Adding More Character Models

1. Get a Ready Player Me avatar:
   - Go to https://readyplayer.me/
   - Create a custom avatar
   - Download the GLB file

2. Add the model:
   ```bash
   # Place the GLB file in public/models/
   cp your-avatar.glb public/models/my-character.glb
   ```

3. Register the character:
   Edit `src/config/avatarConfig.ts`:
   ```typescript
   export const avatarCharacters: AvatarCharacter[] = [
     {
       id: "default",
       name: "Aria",
       description: "Friendly language tutor",
       modelPath: "/models/64f1a714fe61576b46f27ca2.glb",
       personality: "encouraging and patient",
     },
     {
       id: "my-character",
       name: "Alex",
       description: "Your new conversation partner",
       modelPath: "/models/my-character.glb",
       voiceId: "pNInz6obpgDQGcFmaJgB", // Adam's voice
       personality: "energetic and fun",
     },
   ];
   ```

### Customizing Animations

The system uses these animations:
- `Idle` - Default standing pose
- `Talking_0`, `Talking_1`, `Talking_2` - Speaking gestures
- `Crying` - Sad expression
- `Laughing` - Happy expression
- `Angry` - Frustrated expression
- `Terrified` - Surprised/shocked
- `Rumba` - Dancing (for celebrations)

To add custom animations:
1. Create/download FBX animations
2. Place in `public/animations/`
3. Update the animation types in `src/types/avatar.ts`

## Troubleshooting

### Avatar doesn't load
- Check browser console for errors
- Verify models are in `public/models/`
- Ensure Three.js dependencies are installed

### No voice/audio
- Verify `ELEVEN_LABS_API_KEY` is set
- Check ElevenLabs account has credits
- Look for errors in Supabase Edge Function logs

### Lip-sync not working
- With Edge Function: Uses simple approximation (expected)
- For precise lip-sync: Use Node.js + Rhubarb server

### Slow responses
- OpenAI API can take 1-3 seconds
- ElevenLabs TTS adds 1-2 seconds
- Total expected: 2-5 seconds per message

### API costs
- OpenAI GPT-3.5: ~$0.001 per conversation
- ElevenLabs: Free tier 10k characters/month
- Consider implementing response caching

## Next Steps

- [ ] Deploy Edge Function with API keys
- [ ] Test avatar conversation
- [ ] Customize avatar characters
- [ ] (Optional) Set up Node.js server for precise lip-sync
- [ ] Add more conversation scenarios

## Need Help?

- Check [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions)
- Review [ElevenLabs API docs](https://docs.elevenlabs.io/)
- See [Rhubarb Lip Sync guide](https://github.com/DanielSWolf/rhubarb-lip-sync)

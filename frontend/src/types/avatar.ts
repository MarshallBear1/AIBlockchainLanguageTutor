export type FacialExpression = "default" | "smile" | "sad" | "angry" | "surprised" | "funnyFace" | "crazy";

export type AvatarAnimation =
  | "Idle"
  | "Talking_0"
  | "Talking_1"
  | "Talking_2"
  | "Crying"
  | "Rumba"
  | "Angry"
  | "Terrified";

export interface AvatarMessage {
  text: string;
  audio: string; // base64 encoded audio
  facialExpression: FacialExpression;
  animation: AvatarAnimation;
}

// Note: Lipsync is now handled client-side using wawa-lipsync library

export interface AvatarCharacter {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  voiceId?: string; // ElevenLabs voice ID
  thumbnail?: string;
  personality?: string;
}

export interface FacialExpressionMap {
  [key: string]: {
    [morphTarget: string]: number;
  };
}

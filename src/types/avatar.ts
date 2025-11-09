export type FacialExpression = "default" | "smile" | "sad" | "angry" | "surprised" | "funnyFace" | "crazy";

export type AvatarAnimation =
  | "Idle"
  | "Talking_0"
  | "Talking_1"
  | "Talking_2"
  | "Crying"
  | "Laughing"
  | "Rumba"
  | "Angry"
  | "Terrified";

export interface AvatarMessage {
  text: string;
  audio: string; // base64 encoded audio
  lipsync: LipsyncData;
  facialExpression: FacialExpression;
  animation: AvatarAnimation;
}

export interface LipsyncData {
  mouthCues: MouthCue[];
}

export interface MouthCue {
  start: number;
  end: number;
  value: string; // Phoneme like "A", "B", "C", etc.
}

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

export interface VisemeMapping {
  [key: string]: string;
}

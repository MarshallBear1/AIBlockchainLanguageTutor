import { Lipsync } from "wawa-lipsync";

// Create a global lipsync manager instance for real-time audio analysis
export const lipsyncManager = new Lipsync({
  fftSize: 2048,
  historySize: 10,
});


// FIX: Use GoogleGenAI instead of the deprecated GoogleGenerativeAI
import { GoogleGenAI } from "@google/genai";

// Create a single AudioContext for playback to avoid resource issues.
const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

/**
 * Decodes a base64 string into a Uint8Array.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Converts text to speech using the Gemini API and plays the audio.
 * @param text The text to be spoken.
 */
export async function speak(text: string): Promise<void> {
  // Add a prefix to make the speech more natural for a reminder.
  const prompt = `Please say: ${text}`;
  
  try {
    // API key is assumed to be in process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO'],
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000, // TTS model sample rate
        1,     // Mono channel
      );
      
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      source.start();
    } else {
      console.error("TTS API did not return audio data.");
    }
  } catch (error) {
    console.error("Error in text-to-speech service:", error);
    // You could add a fallback here, e.g., a browser-native alert.
  }
}

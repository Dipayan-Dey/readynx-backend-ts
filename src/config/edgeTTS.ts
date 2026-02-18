import { spawn } from "child_process";
import { randomBytes } from "crypto";
import { tmpdir } from "os";
import { join } from "path";
import { unlink } from "fs/promises";
import { readFile } from "fs/promises";

/**
 * edge-tts Configuration Module
 * Provides utilities for interacting with edge-tts CLI
 */

export interface EdgeTTSOptions {
  voice?: string;
  rate?: string; // e.g., "+0%", "-10%", "+20%"
  pitch?: string; // e.g., "+0Hz", "-50Hz", "+100Hz"
}

export interface EdgeTTSResult {
  success: boolean;
  audioPath?: string;
  error?: string;
}

/**
 * Voice mapping table: Google TTS voices to edge-tts voices
 */
const VOICE_MAPPING: Record<string, string> = {
  "en-US-Neural2-F": "en-US-AriaNeural",
  "en-US-Neural2-M": "en-US-GuyNeural",
  "en-US-Wavenet-F": "en-US-JennyNeural",
  "en-US-Wavenet-M": "en-US-ChristopherNeural",
  "en-GB-Neural2-F": "en-GB-SoniaNeural",
  "en-GB-Neural2-M": "en-GB-RyanNeural",
};

/**
 * Default voice for edge-tts
 */
const DEFAULT_VOICE = "en-US-AriaNeural";

/**
 * Check if edge-tts is installed on the system
 * @returns Promise<boolean> - true if edge-tts is installed
 */
export async function checkEdgeTTSInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn("edge-tts", ["--version"]);

    process.on("close", (code) => {
      resolve(code === 0);
    });

    process.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Execute edge-tts command and generate audio file
 * @param text - The text to convert to speech
 * @param outputPath - Path where the audio file should be saved
 * @param options - edge-tts options (voice, rate, pitch)
 * @returns Promise<EdgeTTSResult> - Result containing success status and audio path or error
 */
export async function executeEdgeTTS(
  text: string,
  outputPath: string,
  options: EdgeTTSOptions = {},
): Promise<EdgeTTSResult> {
  return new Promise((resolve) => {
    const args = ["--text", text, "--write-media", outputPath];

    // Add voice option
    if (options.voice) {
      args.push("--voice", options.voice);
    }

    // Add rate option
    if (options.rate) {
      args.push("--rate", options.rate);
    }

    // Add pitch option
    if (options.pitch) {
      args.push("--pitch", options.pitch);
    }

    const edgeProcess = spawn("edge-tts", args);
    let stderr = "";

    edgeProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    edgeProcess.on("close", (code) => {
      if (code === 0) {
        resolve({
          success: true,
          audioPath: outputPath,
        });
      } else {
        resolve({
          success: false,
          error: stderr || `edge-tts process exited with code ${code}`,
        });
      }
    });

    edgeProcess.on("error", (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });
  });
}

/**
 * Map Google TTS voice name to edge-tts voice name
 * @param googleVoice - Google TTS voice name (optional)
 * @returns edge-tts voice name
 */
export function mapVoiceToEdgeTTS(googleVoice?: string): string {
  if (!googleVoice) {
    return DEFAULT_VOICE;
  }

  // Use hasOwnProperty to avoid prototype chain issues
  if (Object.prototype.hasOwnProperty.call(VOICE_MAPPING, googleVoice)) {
    return VOICE_MAPPING[googleVoice];
  }

  return DEFAULT_VOICE;
}

/**
 * Convert rate number to edge-tts percentage string
 * @param rate - Rate value (0.1 to 10, where 1.0 is normal)
 * @returns Percentage string (e.g., "+0%", "+20%", "-20%")
 */
export function convertRateToPercentage(rate: number = 1.0): string {
  const percentage = Math.round((rate - 1.0) * 100);
  return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
}

/**
 * Convert pitch number to edge-tts Hz string
 * @param pitch - Pitch value (-20 to 20, where 0 is normal)
 * @returns Hz string (e.g., "+0Hz", "+25Hz", "-25Hz")
 */
export function convertPitchToHz(pitch: number = 0): string {
  const hz = Math.round(pitch * 5);
  return hz >= 0 ? `+${hz}Hz` : `${hz}Hz`;
}

/**
 * Generate a temporary file path for audio output
 * @returns Temporary file path
 */
export function generateTempFilePath(): string {
  const randomName = randomBytes(16).toString("hex");
  return join(tmpdir(), `edge-tts-${randomName}.mp3`);
}

/**
 * Read audio file and return as buffer, then delete the file
 * @param filePath - Path to the audio file
 * @returns Audio buffer
 */
export async function readAndCleanupAudioFile(
  filePath: string,
): Promise<Buffer> {
  try {
    const buffer = await readFile(filePath);
    await unlink(filePath);
    return buffer;
  } catch (error: any) {
    // Try to cleanup even if read failed
    try {
      await unlink(filePath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

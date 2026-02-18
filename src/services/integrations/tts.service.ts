import {
  checkEdgeTTSInstalled,
  executeEdgeTTS,
  mapVoiceToEdgeTTS,
  convertRateToPercentage,
  convertPitchToHz,
  generateTempFilePath,
  readAndCleanupAudioFile,
  type EdgeTTSOptions,
} from "../../config/edgeTTS";

/**
 * Text-to-Speech Service
 * Provides audio generation for interview questions using edge-tts
 */

interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  language?: string;
}

class TTSService {
  private availabilityCache: boolean | null = null;

  /**
   * Generate audio for the given text using edge-tts
   * @param text - The text to convert to speech
   * @param options - TTS configuration options
   * @returns Audio buffer in MP3 format
   */
  async generateSpeech(
    text: string,
    options: TTSOptions = {},
  ): Promise<Buffer> {
    let tempFilePath: string | null = null;

    try {
      // Validate input text
      if (!text || typeof text !== "string") {
        console.error("[TTS Service] Invalid text input:", typeof text, text);
        return Buffer.from([]);
      }

      // Convert to string and trim
      const textString = String(text).trim();

      if (textString.length === 0) {
        console.warn(
          "[TTS Service] Empty text provided, returning empty buffer",
        );
        return Buffer.from([]);
      }

      // Check if edge-tts is available
      const available = await this.isAvailable();
      if (!available) {
        console.warn(
          "[TTS Service] edge-tts not installed, returning empty buffer",
        );
        return Buffer.from([]);
      }

      console.log(
        `[TTS Service] Generating speech for: "${textString.substring(0, 50)}..."`,
      );

      // Generate temporary file path
      tempFilePath = generateTempFilePath();

      // Convert options to edge-tts format
      const edgeTTSOptions: EdgeTTSOptions = {
        voice: mapVoiceToEdgeTTS(options.voice),
        rate:
          options.rate !== undefined
            ? convertRateToPercentage(options.rate)
            : undefined,
        pitch:
          options.pitch !== undefined
            ? convertPitchToHz(options.pitch)
            : undefined,
      };

      // Execute edge-tts command
      const result = await executeEdgeTTS(
        textString,
        tempFilePath,
        edgeTTSOptions,
      );

      if (!result.success) {
        console.error("[TTS Service] edge-tts command failed:", result.error);
        return Buffer.from([]);
      }

      // Read generated MP3 file into buffer
      const audioBuffer = await readAndCleanupAudioFile(tempFilePath);
      tempFilePath = null; // Mark as cleaned up

      console.log(
        `[TTS Service] Successfully generated ${audioBuffer.length} bytes of audio`,
      );

      return audioBuffer;
    } catch (error: any) {
      console.error("[TTS Service] Error generating speech:", error);
      return Buffer.from([]);
    } finally {
      // Cleanup temporary file if it still exists
      if (tempFilePath) {
        try {
          const { unlink } = await import("fs/promises");
          await unlink(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Check if TTS service is available (edge-tts installed)
   * @returns true if edge-tts is installed and accessible
   */
  async isAvailable(): Promise<boolean> {
    // Return cached result if available
    if (this.availabilityCache !== null) {
      return this.availabilityCache;
    }

    // Check if edge-tts is installed
    this.availabilityCache = await checkEdgeTTSInstalled();
    return this.availabilityCache;
  }

  /**
   * Get list of available voices for a language
   * @param languageCode - Language code (e.g., "en-US")
   * @returns List of available voices
   */
  async getAvailableVoices(languageCode: string = "en-US"): Promise<any[]> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return [];
      }

      // Execute edge-tts --list-voices command
      const { spawn } = await import("child_process");

      return new Promise((resolve) => {
        const process = spawn("edge-tts", ["--list-voices"]);
        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        process.on("close", (code) => {
          if (code !== 0) {
            console.error("[TTS Service] Error listing voices:", stderr);
            resolve([]);
            return;
          }

          // Parse output to extract voices for specified language
          const lines = stdout.split("\n");
          const voices: any[] = [];

          for (const line of lines) {
            // edge-tts output format: Name: en-US-AriaNeural
            if (line.includes("Name:") && line.includes(languageCode)) {
              const match = line.match(/Name:\s*(\S+)/);
              if (match) {
                voices.push({
                  name: match[1],
                  languageCode: languageCode,
                });
              }
            }
          }

          resolve(voices);
        });

        process.on("error", (error) => {
          console.error("[TTS Service] Error executing edge-tts:", error);
          resolve([]);
        });
      });
    } catch (error) {
      console.error("[TTS Service] Error fetching available voices:", error);
      return [];
    }
  }
}

export default new TTSService();

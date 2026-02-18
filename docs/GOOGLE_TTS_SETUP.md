# Google Cloud Text-to-Speech Setup Guide

This guide explains how to set up Google Cloud Text-to-Speech (TTS) for the AI Voice Interview feature.

## Overview

The application uses Google Cloud Text-to-Speech API to convert interview questions into natural-sounding audio. The service supports multiple authentication methods and provides graceful fallback when not configured.

## Authentication Methods

### Option 1: API Key (Recommended for Development)

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Text-to-Speech API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Text-to-Speech API"
   - Click "Enable"

3. **Create an API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
   - (Optional) Restrict the API key to only Text-to-Speech API for security

4. **Add to Environment Variables**
   ```bash
   GOOGLE_TTS_API_KEY=your_api_key_here
   ```

### Option 2: Service Account (Recommended for Production)

1. **Create a Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name it (e.g., "tts-service-account")
   - Grant role: "Cloud Text-to-Speech User"

2. **Generate JSON Key**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

3. **Add to Environment Variables**

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```

   Or place the JSON file in your project and reference it:

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-tts-credentials.json
   ```

## Configuration

Add one of the following to your `.env` file:

```env
# Option 1: API Key (simpler, good for development)
GOOGLE_TTS_API_KEY=your_api_key_here

# Option 2: Service Account (more secure, good for production)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Voice Options

The default configuration uses:

- **Voice**: `en-US-Neural2-F` (Female neural voice)
- **Language**: `en-US` (US English)
- **Audio Format**: MP3
- **Speaking Rate**: 1.0 (normal speed)
- **Pitch**: 0.0 (normal pitch)

### Available Voices

To see all available voices:

```typescript
import ttsService from "./services/integrations/tts.service";

const voices = await ttsService.getAvailableVoices("en-US");
console.log(voices);
```

Popular English voices:

- `en-US-Neural2-F` - Female, natural
- `en-US-Neural2-M` - Male, natural
- `en-US-Wavenet-F` - Female, high quality
- `en-US-Wavenet-M` - Male, high quality
- `en-GB-Neural2-F` - British Female
- `en-GB-Neural2-M` - British Male

## Usage

The TTS service is automatically used by the interview system:

```typescript
import ttsService from "./services/integrations/tts.service";

// Generate speech
const audioBuffer = await ttsService.generateSpeech(
  "What is your experience with React?",
  {
    voice: "en-US-Neural2-F",
    rate: 1.0,
    pitch: 0.0,
    language: "en-US",
  },
);

// Check if service is available
if (ttsService.isAvailable()) {
  console.log("TTS service is configured and ready");
}
```

## Graceful Degradation

The service is designed to fail gracefully:

1. **No Configuration**: Returns empty audio buffer, frontend uses Web Speech API fallback
2. **API Errors**: Logs error and returns empty buffer
3. **Rate Limiting**: Throws error for proper handling by caller

## Testing

Test the TTS integration:

```bash
# Start the server
npm run start:dev

# Test the endpoint
curl http://localhost:5000/api/v1/live-interview/question/0/audio
```

## Pricing

Google Cloud Text-to-Speech pricing (as of 2024):

- **Standard voices**: $4 per 1 million characters
- **WaveNet voices**: $16 per 1 million characters
- **Neural2 voices**: $16 per 1 million characters
- **Free tier**: 0-4 million characters per month

For a typical interview:

- 10 questions × ~100 characters = 1,000 characters
- Cost: ~$0.016 per interview (Neural2 voice)

## Troubleshooting

### "GOOGLE_TTS_API_KEY is not defined"

- Ensure the API key is set in `.env` file
- Restart the server after adding environment variables

### "Permission denied" or "API not enabled"

- Enable Text-to-Speech API in Google Cloud Console
- Check service account has "Cloud Text-to-Speech User" role

### "Invalid API key"

- Verify the API key is correct
- Check if API key restrictions allow Text-to-Speech API

### "Quota exceeded"

- Check your Google Cloud billing and quotas
- Consider upgrading your plan or optimizing usage

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use API key restrictions** in Google Cloud Console
3. **Rotate API keys** regularly
4. **Use service accounts** for production deployments
5. **Monitor usage** in Google Cloud Console

## Alternative TTS Providers

If you prefer a different TTS provider, you can modify `src/services/integrations/tts.service.ts`:

- **AWS Polly**: Amazon's TTS service
- **Azure Speech Service**: Microsoft's TTS service
- **ElevenLabs**: High-quality AI voices
- **Web Speech API**: Browser-based (no backend needed)

## References

- [Google Cloud Text-to-Speech Documentation](https://cloud.google.com/text-to-speech/docs)
- [Voice List](https://cloud.google.com/text-to-speech/docs/voices)
- [Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Node.js Client Library](https://github.com/googleapis/nodejs-text-to-speech)

# Text-to-Speech Integration

## Overview

The TTS (Text-to-Speech) service has been integrated with Google Cloud Text-to-Speech API to provide natural-sounding audio for interview questions.

## What Was Implemented

### 1. Google Cloud TTS Configuration (`src/config/googleTTS.ts`)

- Initializes Google Cloud Text-to-Speech client
- Supports two authentication methods:
  - API Key (recommended for development)
  - Service Account JSON (recommended for production)
- Provides helper functions to check configuration status

### 2. TTS Service (`src/services/integrations/tts.service.ts`)

Updated from placeholder to full implementation:

**Features:**

- `generateSpeech(text, options)` - Converts text to MP3 audio
- `isAvailable()` - Checks if service is properly configured
- `getAvailableVoices(languageCode)` - Lists available voices

**Configuration Options:**

- Voice selection (default: `en-US-Neural2-F`)
- Speaking rate (0.1 to 10, default: 1.0)
- Pitch adjustment (-20 to 20, default: 0.0)
- Language code (default: `en-US`)

**Graceful Degradation:**

- Returns empty buffer when not configured
- Frontend can fallback to Web Speech API
- Logs warnings instead of throwing errors for configuration issues

### 3. API Endpoint

The existing endpoint `/api/v1/live-interview/question/:sessionId/:questionIndex/audio` now:

- Generates real audio using Google Cloud TTS
- Returns MP3 audio stream
- Includes proper caching headers (1 hour)
- Returns 503 status when TTS is unavailable (for graceful fallback)

### 4. Tests

**Unit Tests (`src/services/integrations/__tests__/tts.service.test.ts`):**

- Tests configuration detection
- Tests graceful degradation when not configured
- Tests custom voice options
- Tests voice listing functionality

**Integration Tests:**

- Existing `getQuestionAudio.test.ts` passes with new implementation
- Tests endpoint behavior with and without TTS configuration

## Setup Instructions

### Quick Start (Development)

1. Get a Google Cloud API Key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Cloud Text-to-Speech API"
   - Create an API Key

2. Add to `.env`:

   ```env
   GOOGLE_TTS_API_KEY=your_api_key_here
   ```

3. Restart the server:
   ```bash
   npm run start:dev
   ```

### Production Setup

See [GOOGLE_TTS_SETUP.md](./GOOGLE_TTS_SETUP.md) for detailed instructions on:

- Creating service accounts
- Setting up authentication
- Security best practices
- Cost optimization

## Usage

### Backend

```typescript
import ttsService from "./services/integrations/tts.service";

// Check if configured
if (ttsService.isAvailable()) {
  // Generate audio
  const audioBuffer = await ttsService.generateSpeech(
    "What is your experience with React?",
    {
      voice: "en-US-Neural2-F",
      rate: 1.0,
      pitch: 0.0,
      language: "en-US",
    },
  );

  // audioBuffer is MP3 format, ready to stream
}
```

### Frontend

```typescript
// Fetch audio for a question
const response = await fetch(
  `/api/v1/live-interview/question/${sessionId}/${questionIndex}/audio`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

if (response.ok) {
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
} else if (response.status === 503) {
  // TTS not available, use Web Speech API fallback
  const utterance = new SpeechSynthesisUtterance(questionText);
  speechSynthesis.speak(utterance);
}
```

## Voice Options

### Default Voice

- **Name**: `en-US-Neural2-F`
- **Type**: Neural (high quality)
- **Gender**: Female
- **Language**: US English

### Other Popular Voices

- `en-US-Neural2-M` - Male, natural
- `en-US-Wavenet-F` - Female, high quality
- `en-GB-Neural2-F` - British Female
- `en-GB-Neural2-M` - British Male

To list all available voices:

```typescript
const voices = await ttsService.getAvailableVoices("en-US");
console.log(voices);
```

## Cost Considerations

Google Cloud TTS pricing (Neural2 voices):

- **Rate**: $16 per 1 million characters
- **Free tier**: 0-4 million characters/month

For typical usage:

- Average question: ~100 characters
- 10 questions per interview: ~1,000 characters
- Cost per interview: ~$0.016
- Free tier covers: ~40,000 interviews/month

## Error Handling

The service handles errors gracefully:

1. **No Configuration**: Returns empty buffer, logs warning
2. **API Errors**: Throws error with descriptive message
3. **Rate Limiting**: Throws error (caller should implement retry)
4. **Network Issues**: Throws error (caller should handle)

## Testing

Run tests:

```bash
# Test TTS service
npm test -- tts.service.test.ts

# Test endpoint integration
npm test -- getQuestionAudio.test.ts

# Run all tests
npm test
```

## Troubleshooting

### Service Not Available

- Check if `GOOGLE_TTS_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` is set
- Verify API is enabled in Google Cloud Console
- Check API key restrictions

### Audio Not Playing

- Verify endpoint returns 200 status
- Check browser console for errors
- Ensure audio format (MP3) is supported

### Rate Limiting

- Monitor usage in Google Cloud Console
- Implement caching for frequently used questions
- Consider upgrading quota if needed

## Future Enhancements

Potential improvements:

- [ ] Cache generated audio files
- [ ] Support multiple languages
- [ ] Add voice customization in UI
- [ ] Implement audio preprocessing (normalization)
- [ ] Add support for SSML (Speech Synthesis Markup Language)
- [ ] Alternative TTS providers (AWS Polly, Azure)

## References

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Setup Guide](./GOOGLE_TTS_SETUP.md)
- [Voice List](https://cloud.google.com/text-to-speech/docs/voices)
- [Pricing](https://cloud.google.com/text-to-speech/pricing)

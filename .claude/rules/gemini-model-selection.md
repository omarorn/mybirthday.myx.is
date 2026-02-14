# Gemini Model Selection Guidelines

**Purpose:** Ensure consistent and optimal Gemini model usage across the codebase
**Applies to:** Files matching `**/services/*gemini*.ts`, `**/services/*ai*.ts`, `**/*genai*.ts`
**Priority:** P1 (Prevents deprecation issues and optimizes costs)
**Created:** February 1, 2026

---

## Rule: Always Use Generic Model Names

**IMPORTANT:** Always use generic model names (e.g., `-latest`, `-lite`) to avoid deprecation issues.

### Model Configuration

| Service | Model | Reason |
|---------|-------|--------|
| **Fast Responses** | `gemini-2.5-flash` | General purpose, good speed/accuracy |
| **Classification/Vision** | `gemini-2.5-flash` | Needs accuracy for visual tasks |
| **Image Generation** | `gemini-3-pro-image-preview` | Better quality for visual output |
| **Complex Questions** | `gemini-3-pro-preview` | Thinking budget for complex tasks |
| **Image Editing** | `gemini-2.5-flash-image` | Image processing with speed |
| **Search Grounding** | `gemini-2.5-flash` | Fast with Google Search tool |
| **Audio Transcription** | `gemini-2.5-flash` | Multimodal audio support |
| **Text-to-Speech** | `gemini-2.5-flash-preview-tts` | Specialized TTS model with audio |

---

## Model Selection Guidelines

### Speed-Optimized Tasks
Use `gemini-2.5-flash` or `gemini-2.5-flash-lite`:
- Simple text generation (jokes, greetings)
- Fast classifications
- Audio transcription
- Search with grounding

```typescript
// ✅ GOOD: Fast model for simple tasks
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
});
```

### Quality-Critical Tasks
Use `gemini-3-pro-preview` or `gemini-3-pro-image-preview`:
- Complex reasoning with thinking budget
- High-quality image generation
- Icon/graphic generation

```typescript
// ✅ GOOD: Pro model with thinking for complex tasks
const response = await ai.models.generateContent({
  model: "gemini-3-pro-preview",
  contents: question,
  config: {
    thinkingConfig: { thinkingBudget: 2048 }
  }
});
```

### Image Tasks
Use appropriate image model:
- `gemini-2.5-flash-image` - Fast image editing
- `gemini-3-pro-image-preview` - High-quality generation

```typescript
// ✅ GOOD: Image model for visual tasks
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: {
    parts: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      { text: "Edit this image..." }
    ]
  }
});
```

### Text-to-Speech
**ONLY** use `gemini-2.5-flash-preview-tts` for audio generation:

```typescript
// ✅ GOOD: TTS-specific model
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash-preview-tts",
  contents: textToSpeak,
  config: {
    responseModalities: ["AUDIO"],
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
    }
  }
});
```

---

## Anti-Patterns

### Don't Use Deprecated Model Names

```typescript
// ❌ BAD: Specific version will be deprecated
model: "gemini-1.5-flash-001"
model: "gemini-pro-vision"

// ✅ GOOD: Use generic names
model: "gemini-2.5-flash"
model: "gemini-3-pro-preview"
```

### Don't Use Wrong Model for Task

```typescript
// ❌ BAD: Using TTS model for text generation
model: "gemini-2.5-flash-preview-tts"
contents: "Generate a joke"

// ✅ GOOD: Use flash for text, TTS for audio
model: "gemini-2.5-flash"
contents: "Generate a joke"
```

### Don't Over-Engineer Simple Tasks

```typescript
// ❌ BAD: Pro model for simple greeting
model: "gemini-3-pro-preview"
contents: "Say hello in Icelandic"

// ✅ GOOD: Flash is sufficient
model: "gemini-2.5-flash"
contents: "Say hello in Icelandic"
```

---

## Model Capabilities Summary

| Model | Text | Vision | Image Gen | Audio | TTS | Thinking |
|-------|------|--------|-----------|-------|-----|----------|
| `gemini-2.5-flash` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `gemini-2.5-flash-image` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `gemini-2.5-flash-preview-tts` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `gemini-3-pro-preview` | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| `gemini-3-pro-image-preview` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## References

- **Google AI SDK:** https://ai.google.dev/gemini-api/docs
- **Model Deprecation:** https://ai.google.dev/gemini-api/docs/deprecation

---

**This rule ensures optimal model selection and prevents deprecation issues.**

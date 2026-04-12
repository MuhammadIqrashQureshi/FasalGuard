const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

const mapLanguageCode = (language) => {
  const normalized = String(language || '').toLowerCase();
  if (normalized.startsWith('hi')) return 'hi';
  if (normalized.startsWith('ur')) return 'ur';
  return 'en';
};

const resolveVoiceId = (language) => {
  const normalized = String(language || '').toLowerCase();
  if (normalized.startsWith('ur') && process.env.ELEVENLABS_VOICE_ID_URDU) {
    return process.env.ELEVENLABS_VOICE_ID_URDU;
  }
  if (normalized.startsWith('hi') && process.env.ELEVENLABS_VOICE_ID_HINDI) {
    return process.env.ELEVENLABS_VOICE_ID_HINDI;
  }
  if (process.env.ELEVENLABS_VOICE_ID_MULTILINGUAL) {
    return process.env.ELEVENLABS_VOICE_ID_MULTILINGUAL;
  }
  return process.env.ELEVENLABS_VOICE_ID || '';
};

const resolveGroqTargetLanguage = (language) => {
  const normalized = String(language || '').toLowerCase();
  if (normalized.startsWith('ur')) return 'Urdu';
  if (normalized.startsWith('hi')) return 'Hindi';
  return 'English';
};

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'ELEVENLABS_API_KEY is missing in backend config',
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required',
      });
    }

    const language = mapLanguageCode(req.body?.language || 'en-US');

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'voice.webm',
      contentType: req.file.mimetype || 'audio/webm',
    });
    form.append('model_id', 'scribe_v1');
    form.append('language_code', language);

    const response = await axios.post('https://api.elevenlabs.io/v1/speech-to-text', form, {
      headers: {
        ...form.getHeaders(),
        'xi-api-key': apiKey,
      },
      timeout: 25000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const payload = response.data || {};
    const text = String(payload.text || payload.transcript || '').trim();

    return res.json({
      success: true,
      text,
      raw: payload,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const providerMessage = error?.response?.data?.detail || error?.response?.data?.message || error.message;
    console.error('ElevenLabs transcription error:', providerMessage);

    return res.status(status).json({
      success: false,
      message: 'Failed to transcribe audio with ElevenLabs',
      error: providerMessage,
    });
  }
});

router.post('/synthesize', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'ELEVENLABS_API_KEY is missing in backend config',
      });
    }

    const { text, language = 'en-US', voiceId: requestVoiceId } = req.body || {};
    const normalizedText = String(text || '').trim();

    if (!normalizedText) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for synthesis',
      });
    }

    const voiceId = String(requestVoiceId || resolveVoiceId(language)).trim();
    if (!voiceId) {
      return res.status(400).json({
        success: false,
        message: 'No ElevenLabs voice configured. Set ELEVENLABS_VOICE_ID or provide voiceId.',
      });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: normalizedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      },
    );

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(Buffer.from(response.data));
  } catch (error) {
    const status = error?.response?.status || 500;
    const providerMessage = error?.response?.data?.detail || error?.response?.data?.message || error.message;
    console.error('ElevenLabs synthesis error:', providerMessage);

    return res.status(status).json({
      success: false,
      message: 'Failed to synthesize audio with ElevenLabs',
      error: providerMessage,
    });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY is missing in backend config',
      });
    }

    const { text, targetLanguage = 'en-US', sourceLanguage = 'en-US' } = req.body || {};
    const inputText = String(text || '').trim();
    if (!inputText) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for translation',
      });
    }

    const target = resolveGroqTargetLanguage(targetLanguage);
    const source = resolveGroqTargetLanguage(sourceLanguage);

    console.log(
      `[Groq Translate] request source=${source} target=${target} chars=${inputText.length}`,
    );

    if (target === 'English' && source === 'English') {
      console.log('[Groq Translate] skipped (source and target are both English)');
      return res.json({
        success: true,
        text: inputText,
      });
    }

    const model = process.env.GROQ_TRANSLATE_MODEL || 'llama-3.1-8b-instant';
    const systemPrompt = [
      'You are a professional agricultural translator.',
      'Translate exactly and preserve meaning.',
      'Keep line breaks, bullet numbering, units, crop names, and numeric values unchanged.',
      'Do not add explanations or markdown.',
      'Output only translated text.',
    ].join(' ');

    const userPrompt = [
      `Translate the following text from ${source} to ${target}.`,
      'Use simple farmer-friendly wording.',
      'TEXT START',
      inputText,
      'TEXT END',
    ].join('\n');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      },
    );

    const translated = String(response?.data?.choices?.[0]?.message?.content || '').trim();
    console.log(
      `[Groq Translate] success source=${source} target=${target} translatedChars=${translated.length || inputText.length}`,
    );
    return res.json({
      success: true,
      text: translated || inputText,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const providerMessage = error?.response?.data?.error?.message || error?.response?.data?.message || error.message;
    console.error('Groq translation error:', providerMessage);
    console.error('[Groq Translate] failed');

    return res.status(status).json({
      success: false,
      message: 'Failed to translate text with Groq',
      error: providerMessage,
    });
  }
});

module.exports = router;

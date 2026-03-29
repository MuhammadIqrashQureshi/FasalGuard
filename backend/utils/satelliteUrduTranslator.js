const URL_PATTERN = /^https?:\/\//i;
const NON_TEXT_PATTERN = /^[\d\s\-_:/.+,()%]+$/;

const PHRASE_REPLACEMENTS = [
  ['Actionable Recommendations', 'عملی سفارشات'],
  ['Top Recommendations', 'اہم سفارشات'],
  ['Field requires attention', 'کھیت کو توجہ درکار ہے'],
  ['Field is performing well', 'کھیت کی کارکردگی اچھی ہے'],
  ['Critical field stress detected', 'کھیت میں شدید دباؤ پایا گیا ہے'],
  ['immediate irrigation advisory required', 'فوری آبپاشی کی ضرورت ہے'],
  ['Needs Attention', 'توجہ درکار'],
  ['High', 'زیادہ'],
  ['Medium', 'درمیانہ'],
  ['Low', 'کم'],
  ['Critical', 'شدید'],
  ['Irrigation Advisory', 'آبپاشی ہدایت'],
  ['Nutrient Advisory', 'غذائی ہدایت'],
  ['Pest / Disease Advisory', 'کیڑا / بیماری ہدایت'],
  ['Field Action', 'کھیتی اقدام'],
  ['Today', 'آج'],
  ['This week', 'اس ہفتے'],
];

const WORD_REPLACEMENTS = [
  ['irrigation', 'آبپاشی'],
  ['fertilizer', 'کھاد'],
  ['nutrient', 'غذائی جز'],
  ['spray', 'اسپرے'],
  ['field', 'کھیت'],
  ['crop', 'فصل'],
  ['soil', 'مٹی'],
  ['weather', 'موسم'],
  ['rain', 'بارش'],
  ['wind', 'ہوا'],
  ['drainage', 'نکاسی'],
  ['stress', 'دباؤ'],
  ['yield', 'پیداوار'],
  ['risk', 'خطرہ'],
  ['monitor', 'نگرانی کریں'],
  ['check', 'چیک کریں'],
  ['urgent', 'فوری'],
  ['immediate', 'فوری'],
  ['wheat', 'گندم'],
  ['maize', 'مکئی'],
  ['rice', 'چاول'],
  ['cotton', 'کپاس'],
  ['sugarcane', 'گنا'],
];

const EXCLUDED_KEYS = new Set([
  'category',
  'priority',
  'status',
  'source',
  'session_id',
  'field_signature',
  'tile_url',
  'url',
  'id',
  '_id',
]);

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeSpacedText = (value) => value
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.;:!?])/g, '$1')
  .trim();

const translateTextToUrdu = (value) => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return value;
  if (URL_PATTERN.test(trimmed) || NON_TEXT_PATTERN.test(trimmed)) return value;

  let output = trimmed;

  for (const [source, target] of PHRASE_REPLACEMENTS) {
    const pattern = new RegExp(escapeRegExp(source), 'gi');
    output = output.replace(pattern, target);
  }

  for (const [source, target] of WORD_REPLACEMENTS) {
    const pattern = new RegExp(`\\b${escapeRegExp(source)}\\b`, 'gi');
    output = output.replace(pattern, target);
  }

  return normalizeSpacedText(output);
};

const localizeSatellitePayloadToUrdu = (value, key = '') => {
  if (Array.isArray(value)) {
    return value.map((item) => localizeSatellitePayloadToUrdu(item, ''));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        localizeSatellitePayloadToUrdu(entryValue, entryKey),
      ]),
    );
  }

  if (typeof value === 'string' && !EXCLUDED_KEYS.has(key)) {
    return translateTextToUrdu(value);
  }

  return value;
};

const resolveRequestLanguage = (req) => {
  const queryLang = String(req?.query?.lang || '').trim().toLowerCase();
  const bodyLang = String(req?.body?.lang || '').trim().toLowerCase();
  const headerLang = String(req?.headers?.['x-language'] || req?.headers?.['accept-language'] || '').trim().toLowerCase();
  const merged = queryLang || bodyLang || headerLang;
  return merged.startsWith('ur') ? 'ur' : 'en';
};

module.exports = {
  resolveRequestLanguage,
  localizeSatellitePayloadToUrdu,
};

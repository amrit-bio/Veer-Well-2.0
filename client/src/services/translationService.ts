import { getActiveAiKey, API_BASE } from './api';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  script: string;
}

// All 22 8th Schedule Official Indian Languages + English
export const SUPPORTED_INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Pan-India', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North/Central India', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal, Tripura', script: 'Bengali' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh, Telangana', script: 'Telugu' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra, Goa', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu, Puducherry', script: 'Tamil' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat, Daman & Diu', script: 'Gujarati' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Jammu & Kashmir, UP, Telangana', script: 'Perso-Arabic' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka', script: 'Kannada' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha', script: 'Odia' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala, Lakshadweep', script: 'Malayalam' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab, Delhi, Haryana', script: 'Gurmukhi' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Assam', script: 'Assamese' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'Bihar, Jharkhand', script: 'Devanagari' },
  { code: 'sat', name: 'Santali', nativeName: 'संताली', region: 'Jharkhand, Odisha, WB', script: 'Ol Chiki / Devanagari' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', region: 'Jammu & Kashmir', script: 'Devanagari / Arabic' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Sikkim, West Bengal', script: 'Devanagari' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', region: 'Goa, Maharashtra, Karnataka', script: 'Devanagari' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी / سنڌي', region: 'Gujarat, Maharashtra, Rajasthan', script: 'Devanagari / Arabic' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', region: 'Jammu & Kashmir', script: 'Devanagari' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', region: 'Manipur', script: 'Bengali-Assamese / Meitei' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', region: 'Assam, Bodoland', script: 'Devanagari' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'National / Classical', script: 'Devanagari' },
];

// In-memory memory dictionary cache
const memoryCache = new Map<string, Map<string, string>>();

// Helper to get local cache
function getLanguageStorageCache(lang: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`veerwell_trans_${lang}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to set local cache
function setLanguageStorageCache(lang: string, key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLanguageStorageCache(lang);
    current[key] = value;
    localStorage.setItem(`veerwell_trans_${lang}`, JSON.stringify(current));
  } catch {
    // Ignore quota errors
  }
}

// Check if string is a number, punctuation, or military acronym to not corrupt
const PRESERVE_REGEX = /^(CRPF|BSF|ITBP|CISF|SSB|NSG|MHA|CAPF|CoBRA|SpO2|HRV|BPET|AI|JWT|URL|ID|AMS|HAPE|HACE|TCCC|GPS|UTC|REST|API|GBDT|XGBoost|PHQ-9|MBI|\d+([\.,]\d+)?%?|\s+|[.,\/#!$%\^&\*;:{}=\-_`~()]+)$/i;

/**
 * Direct call to Google Translate API endpoint (free/gtx)
 */
async function translateViaGoogleApi(text: string, targetLang: string, sourceLang = 'auto'): Promise<string> {
  const codeMap: Record<string, string> = {
    mai: 'bho',
    sat: 'hi',
    doi: 'hi',
    brx: 'as',
    kok: 'gom',
    mni: 'bn',
  };

  const finalLang = codeMap[targetLang] || targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${finalLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Translate API error: ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map((item: any) => item[0]).join('');
  }
  throw new Error('Unexpected translation response format');
}

/**
 * Direct call to Gemini / AI model for accurate, military-context translation
 */
async function translateViaGemini(texts: string[], targetLang: string): Promise<string[]> {
  const activeKey = getActiveAiKey();
  if (!activeKey) throw new Error('No AI Key available');

  const langObj = SUPPORTED_INDIAN_LANGUAGES.find((l) => l.code === targetLang);
  const targetName = langObj ? `${langObj.name} (${langObj.nativeName})` : targetLang;

  const prompt = `You are an expert military and defense translator. Translate the following UI elements/phrases into ${targetName}.
Keep all acronyms (CRPF, BSF, ITBP, CISF, SSB, NSG, CAPF, CoBRA, SpO2, HRV, BPET, AI, ID, MHA) unchanged.
Preserve markdown and punctuation.
Respond ONLY with a valid JSON array of translated strings in the EXACT same order.
Input array:
${JSON.stringify(texts)}`;

  const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of geminiModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length === texts.length) {
          return parsed;
        }
      }
    } catch {
      // Continue to next model
    }
  }

  throw new Error('Gemini translation failed');
}

/**
 * Translate via backend /api/translate endpoint if available
 */
async function translateViaBackendApi(texts: string[], targetLang: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, targetLang }),
  });

  if (!res.ok) throw new Error(`Backend translate failed: ${res.status}`);
  const data = await res.json();
  if (data?.success && Array.isArray(data.translations)) {
    return data.translations;
  }
  throw new Error('Invalid backend translation response');
}

/**
 * Main Translation Function
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang = 'en'
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || targetLang === 'en' || targetLang === sourceLang) return text;
  if (PRESERVE_REGEX.test(trimmed)) return text;

  // Check in-memory cache
  if (!memoryCache.has(targetLang)) {
    memoryCache.set(targetLang, new Map());
  }
  const langMem = memoryCache.get(targetLang)!;
  if (langMem.has(trimmed)) {
    return langMem.get(trimmed)!;
  }

  // Check localStorage cache
  const storageCache = getLanguageStorageCache(targetLang);
  if (storageCache[trimmed]) {
    langMem.set(trimmed, storageCache[trimmed]);
    return storageCache[trimmed];
  }

  // Attempt API calls with fallback
  let translated = trimmed;

  // 1. Try Backend API
  try {
    const res = await translateViaBackendApi([trimmed], targetLang);
    if (res[0]) translated = res[0];
  } catch {
    // 2. Try Google Translate Web API
    try {
      translated = await translateViaGoogleApi(trimmed, targetLang, sourceLang);
    } catch {
      // 3. Try Gemini API
      try {
        const res = await translateViaGemini([trimmed], targetLang);
        if (res[0]) translated = res[0];
      } catch {
        // Return original on failure
        translated = trimmed;
      }
    }
  }

  // Cache result
  langMem.set(trimmed, translated);
  setLanguageStorageCache(targetLang, trimmed, translated);

  return translated;
}

/**
 * Batch translation function for efficiency
 */
export async function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang = 'en'
): Promise<string[]> {
  if (targetLang === 'en' || targetLang === sourceLang || texts.length === 0) {
    return texts;
  }

  if (!memoryCache.has(targetLang)) {
    memoryCache.set(targetLang, new Map());
  }
  const langMem = memoryCache.get(targetLang)!;
  const storageCache = getLanguageStorageCache(targetLang);

  const results: string[] = new Array(texts.length);
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const trimmed = t.trim();

    if (!trimmed || PRESERVE_REGEX.test(trimmed)) {
      results[i] = t;
    } else if (langMem.has(trimmed)) {
      results[i] = langMem.get(trimmed)!;
    } else if (storageCache[trimmed]) {
      const val = storageCache[trimmed];
      langMem.set(trimmed, val);
      results[i] = val;
    } else {
      missingIndices.push(i);
      missingTexts.push(trimmed);
    }
  }

  if (missingTexts.length === 0) {
    return results;
  }

  // Translate missing texts in batch
  let translatedBatch: string[] = [];

  // 1. Try Backend API
  try {
    translatedBatch = await translateViaBackendApi(missingTexts, targetLang);
  } catch {
    // 2. Try Gemini API if available
    try {
      translatedBatch = await translateViaGemini(missingTexts, targetLang);
    } catch {
      // 3. Fallback: Google Translate individual / parallel
      try {
        translatedBatch = await Promise.all(
          missingTexts.map((txt) =>
            translateViaGoogleApi(txt, targetLang, sourceLang).catch(() => txt)
          )
        );
      } catch {
        translatedBatch = missingTexts;
      }
    }
  }

  // Fill in missing results and cache
  for (let k = 0; k < missingIndices.length; k++) {
    const original = missingTexts[k];
    const trans = translatedBatch[k] || original;
    const originalIdx = missingIndices[k];

    results[originalIdx] = trans;
    langMem.set(original, trans);
    setLanguageStorageCache(targetLang, original, trans);
  }

  return results;
}

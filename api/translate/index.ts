export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { texts = [], text, targetLang = 'hi', sourceLang = 'en', apiKey = '' } = req.body || {};
    const inputTexts: string[] = Array.isArray(texts) && texts.length > 0 ? texts : (text ? [text] : []);

    if (inputTexts.length === 0) {
      return res.status(400).json({ success: false, error: 'No text provided for translation' });
    }

    if (targetLang === 'en' || targetLang === sourceLang) {
      return res.json({ success: true, translations: inputTexts });
    }

    const GEMINI_API_KEY =
      (req.headers['x-ai-key'] as string) ||
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      '';

    // 1. Try Gemini if valid key present
    if (GEMINI_API_KEY && (GEMINI_API_KEY.startsWith('AQ') || GEMINI_API_KEY.startsWith('AIza'))) {
      const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
      const prompt = `Translate this JSON array of texts into target language code "${targetLang}".
Preserve defense/military acronyms (CRPF, BSF, ITBP, CISF, SSB, NSG, CAPF, CoBRA, SpO2, HRV, BPET, AI, MHA) unchanged.
Preserve numbers, formatting, and markdown symbols.
Output ONLY a JSON array of translated strings with length ${inputTexts.length}.
Input: ${JSON.stringify(inputTexts)}`;

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
          const gemRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
            }),
          });

          if (gemRes.ok) {
            const gemData = await gemRes.json();
            const rawText = gemData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText);
              if (Array.isArray(parsed) && parsed.length === inputTexts.length) {
                return res.json({ success: true, translations: parsed, provider: `Gemini (${model})` });
              }
            }
          }
        } catch {
          // continue fallback
        }
      }
    }

    // 2. Fallback: Google Translate Free Web API (Single/Parallel)
    const codeMap: Record<string, string> = {
      mai: 'bho',
      sat: 'hi',
      doi: 'hi',
      brx: 'as',
      kok: 'gom',
      mni: 'bn',
    };
    const finalTarget = codeMap[targetLang] || targetLang;

    const translations = await Promise.all(
      inputTexts.map(async (t) => {
        if (!t || !t.trim()) return t;
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${finalTarget}&dt=t&q=${encodeURIComponent(
            t
          )}`;
          const r = await fetch(url);
          if (r.ok) {
            const d = await r.json();
            if (Array.isArray(d) && Array.isArray(d[0])) {
              return d[0].map((item: any) => item[0]).join('');
            }
          }
          return t;
        } catch {
          return t;
        }
      })
    );

    return res.json({ success: true, translations, provider: 'Google Translate API' });
  } catch (err: any) {
    console.error('[api/translate] Translation error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Translation failed' });
  }
}

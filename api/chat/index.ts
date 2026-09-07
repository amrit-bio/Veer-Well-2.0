export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { message, messages = [], context = {} } = req.body || {};
    if (!message && (!Array.isArray(messages) || messages.length === 0)) {
      return res.status(400).json({ success: false, error: 'A message is required.' });
    }

    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    const IS_VERTEX_AI = GEMINI_API_KEY.startsWith('AQ');
    const IS_GOOGLE_AI = GEMINI_API_KEY.startsWith('AIza');
    const GEMINI_KEY_VALID = IS_VERTEX_AI || IS_GOOGLE_AI;

    if (!NVIDIA_API_KEY && !GEMINI_KEY_VALID) {
      console.error('[api/chat] No AI key configured. Set NVIDIA_API_KEY or GEMINI_API_KEY in Vercel.');
      return res.status(500).json({ success: false, error: 'No AI API key configured on the server.' });
    }

    const nvidiaMessages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `You are Rakshak AI, a knowledgeable and direct assistant for VeerWell 2.0 — the AI-based predictive personnel stress and welfare monitoring platform for CAPF, CRPF, BSF, ITBP, CISF, SSB, Assam Rifles, NSG, and the Indian Army.

Answer all questions related to: military personnel wellness (stress, fatigue, burnout, sleep, HRV, SpO2, hypoxia, AMS, high-altitude health), Indian Armed Forces & CAPF (ranks, roles, units, commands, organizational structure, operations), tactical protocols (CoBRA, jungle ops, border sentry, high-altitude deployment, post-mission recovery), VeerWell 2.0 platform (features, dashboards, XGBoost predictive model, PHQ-9/MBI assessments, wearable telemetry, duty rotation, welfare alerts), military welfare doctrine (Armed Forces Welfare Doctrine, DPDP Act 2023, privacy controls, duty rest rotation, leave policies), medical protocols for uniformed forces (AMS, HAPE, HACE, ORS, hypoxia management, thermal injury, combat stress), and general military knowledge (equipment, vehicles, weapons systems, communications, logistics, training).

RULES:
1. ANSWER DIRECTLY. No greetings, no apologies, no unsolicited breathing exercises.
2. Be specific. Include exact numbers where known (SpO2 thresholds, HRV figures, duty hour limits, protocol steps).
3. If asked about Indian Army or CAPF ranks, units, commands, or history, answer accurately and comprehensively.
4. If asked about military equipment, vehicles, or weapons, answer from general knowledge.
5. If you genuinely lack specific information, say "I don't have that specific information." — do not guess or invent.
6. Keep responses under 200 words unless the user asks for detail.
7. Use plain text or minimal markdown. No emojis.`,
      },
      ...(Array.isArray(messages) && messages.length > 0
        ? messages
            .filter((m: any) => m.text?.trim())
            .map((m: any) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            }))
        : [{ role: 'user', content: message }]),
    ];

    const contextBlock = context && Object.keys(context).length > 0
      ? `\n\nPersonnel Context: Force=${context.force || 'CRPF'} | Unit=${context.unit || 'N/A'} | Rank=${context.userRank || 'Officer'} | Role=${context.role || 'personnel'} | Altitude=${context.altitudeActive ? 'Yes' : 'No'} | Shift=${context.shiftHours || 'N/A'}hrs`
      : '';
    nvidiaMessages[0].content += contextBlock;

    // Try Gemini / Vertex AI first
    if (GEMINI_KEY_VALID) {
      const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];
      for (const model of GEMINI_MODELS) {
        try {
          const isVertex = IS_VERTEX_AI;
          const url = isVertex
            ? `https://us-central1-aiplatform.googleapis.com/v1beta1/publishers/google/models/${model}:generateContent?key=${GEMINI_API_KEY}`
            : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
          const body = isVertex
            ? { systemInstruction: { role: 'system', parts: [{ text: nvidiaMessages[0].content }] }, contents: nvidiaMessages.slice(1), generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } }
            : { systemInstruction: { parts: [{ text: nvidiaMessages[0].content }] }, contents: nvidiaMessages.slice(1), generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } };
          const gemRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (gemRes.ok) {
            const gemData = await gemRes.json();
            const parts = gemData?.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
              const text = parts.map((p: any) => (typeof p.text === 'string' ? p.text : '')).filter(Boolean).join('\n\n').trim();
              if (text) return res.json({ success: true, reply: text, model: `Rakshak AI (${isVertex ? 'Vertex ' : ''}${model})` });
            }
          }
          console.warn(`[api/chat] Gemini model ${model} failed: ${gemRes.status}`);
        } catch (err) {
          console.warn(`[api/chat] Gemini model ${model} error:`, err);
        }
      }
    }

    // Fallback to NVIDIA NIM
    const NIM_MODELS = [
      'meta/llama-3.3-70b-instruct',
      'meta/llama-3.1-8b-instruct',
      'meta/llama-3.1-70b-instruct',
      'deepseek-ai/DeepSeek-R1',
      'qwen/qwen2.5-72b-instruct',
    ];

    let nimRes: Response;
    let nimData: any;
    for (const model of NIM_MODELS) {
      nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: nvidiaMessages,
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });
      if (nimRes.ok) {
        nimData = await nimRes.json();
        const text = nimData?.choices?.[0]?.message?.content;
        if (typeof text === 'string' && text.trim()) {
          return res.json({ success: true, reply: text.trim(), model: `Rakshak AI (${model})` });
        }
      }
      console.warn(`[api/chat] NVIDIA model ${model} failed: ${nimRes.status}`);
    }

    const lastErr = nimRes ? await nimRes.text() : 'No response from any model';
    console.error('[api/chat] All NVIDIA models failed. Last response:', lastErr);
    return res.status(500).json({ success: false, error: `All NVIDIA models failed. Check Vercel logs.` });
  } catch (error: any) {
    console.error('[api/chat] Server error:', error);
    return res.status(200).json({
      success: true,
      reply: 'Jai Hind. Rakshak AI is temporarily unavailable. Please try again in a moment.',
      model: 'Rakshak Resiliency Core',
    });
  }
}

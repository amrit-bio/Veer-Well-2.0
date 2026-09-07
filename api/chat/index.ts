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
    if (!NVIDIA_API_KEY) {
      console.error('[api/chat] NVIDIA_API_KEY is missing from Vercel environment variables.');
      return res.status(500).json({ success: false, error: 'NVIDIA_API_KEY is not configured on the server. Set it in Vercel Dashboard → Settings → Environment Variables.' });
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

    const nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: nvidiaMessages,
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!nimRes.ok) {
      const errText = await nimRes.text();
      console.error('[api/chat] NVIDIA NIM error:', nimRes.status, errText);
      return res.status(500).json({ success: false, error: `NVIDIA NIM error: ${nimRes.status}` });
    }

    const data = await nimRes.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(500).json({ success: false, error: 'Empty AI response' });
    }

    return res.json({ success: true, reply: text.trim(), model: 'Rakshak AI (NVIDIA NIM)' });
  } catch (error: any) {
    console.error('[api/chat] Server error:', error);
    return res.status(200).json({
      success: true,
      reply: 'Jai Hind. Rakshak AI is temporarily unavailable. Please try again in a moment.',
      model: 'Rakshak Resiliency Core',
    });
  }
}

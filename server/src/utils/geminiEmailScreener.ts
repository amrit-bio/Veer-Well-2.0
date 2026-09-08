/**
 * वीरWell (Rakshak AI) — Gemini Email Screener
 * 
 * Server-side service for screening signup emails using Gemini API.
 * This is the AI Gate in the signup verification pipeline.
 * 
 * IMPORTANT: This module must only be called server-side to protect the API key.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-lite'];

const EMAIL_SCREENING_PROMPT = `You are an email-verification classifier for a government-affiliated signup system.
You do not have authority to approve any signup — you may only flag or clear an email address.

Given the email address below, evaluate it against these criteria:
1. Syntactic validity (proper email format).
2. Whether the domain is a known disposable/temporary email provider.
3. Whether the local part (before @) shows spam patterns (random strings, excessive numbers, keyword stuffing).
4. Whether the domain has valid MX records (if this data is supplied to you).
5. Any mismatch between the email's domain and the department name associated with the service ID, if provided.

Email address: {{email}}
Service ID (context only, do not validate this yourself): {{service_id}}
Department context (if known): {{department}}

Respond ONLY in this JSON format, with no other text:
{
  "status": "clean" | "flagged" | "rejected",
  "reason": "short explanation",
  "confidence": 0.0-1.0
}

Rules:
- "rejected" = clearly spam/disposable/malformed — this will auto-reject the signup, no human will see it.
- "flagged" = suspicious but not certain — treat as reject-and-notify for now unless your system wants a "manual AI review" tier.
- "clean" = passes all checks — this will be sent to a human reviewer for final approval. You are not granting access, only clearing it for human review.`;

export interface EmailScreeningResult {
  status: 'clean' | 'flagged' | 'rejected';
  reason: string;
  confidence: number;
  modelUsed?: string;
  rawResponse?: string;
}

/**
 * Screen an email address using Gemini API.
 * Returns the AI's verdict on whether the email is clean, flagged, or rejected.
 */
export async function screenEmailWithGemini(
  email: string,
  serviceId: string,
  department?: string
): Promise<EmailScreeningResult> {
  if (!GEMINI_API_KEY) {
    return {
      status: 'flagged',
      reason: 'AI screening unavailable — no API key configured',
      confidence: 0,
    };
  }

  const prompt = EMAIL_SCREENING_PROMPT
    .replace('{{email}}', email)
    .replace('{{service_id}}', serviceId)
    .replace('{{department}}', department || 'Not provided');

  // Try each model in order
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[Gemini Screener] Model ${model} failed: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.warn(`[Gemini Screener] Model ${model} returned empty response`);
        continue;
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(text.trim());

        // Validate response structure
        if (!['clean', 'flagged', 'rejected'].includes(parsed.status)) {
          console.warn(`[Gemini Screener] Invalid status from ${model}: ${parsed.status}`);
          continue;
        }

        return {
          status: parsed.status,
          reason: parsed.reason || 'No reason provided',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
          modelUsed: model,
          rawResponse: text,
        };
      } catch (parseError) {
        console.warn(`[Gemini Screener] Failed to parse JSON from ${model}:`, parseError);
        continue;
      }
    } catch (error) {
      console.warn(`[Gemini Screener] Error with model ${model}:`, error);
      continue;
    }
  }

  // All models failed
  return {
    status: 'flagged',
    reason: 'AI screening failed — all models unavailable',
    confidence: 0,
  };
}

/**
 * Fallback heuristic-based email screening (used when Gemini is unavailable).
 * This provides basic validation without AI.
 */
export function heuristicEmailScreen(email: string): EmailScreeningResult {
  const disposableDomains = [
    'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
    'yopmail.com', 'throwaway.email', 'fakeinbox.com', 'temp-mail.org',
    'dispostable.com', 'mailnesia.com', 'tempail.com', 'mohmal.com',
  ];

  const lowerEmail = email.toLowerCase();

  // Basic syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(lowerEmail)) {
    return {
      status: 'rejected',
      reason: 'Invalid email format',
      confidence: 1.0,
    };
  }

  // Extract domain
  const domain = lowerEmail.split('@')[1] || '';

  // Check disposable domains
  if (disposableDomains.some((d) => domain.includes(d))) {
    return {
      status: 'rejected',
      reason: 'Disposable email provider detected',
      confidence: 0.95,
    };
  }

  // Check for spam patterns in local part
  const localPart = lowerEmail.split('@')[0] || '';
  const randomStringPattern = /^[a-z0-9]{12,}$/i;
  const excessiveNumbers = (localPart.match(/\d/g) || []).length > 6;
  const keywordStuffing = /(spam|test|fake|temp|admin|user|pass|login)/i.test(localPart);

  if (randomStringPattern.test(localPart) || excessiveNumbers || keywordStuffing) {
    return {
      status: 'flagged',
      reason: 'Suspicious email pattern detected',
      confidence: 0.7,
    };
  }

  return {
    status: 'clean',
    reason: 'Email passes heuristic checks',
    confidence: 0.6,
  };
}

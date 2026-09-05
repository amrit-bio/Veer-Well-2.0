import { WearableTelemetry, RiskAlert, VoiceLog, SystemTelemetry } from '../types';

export interface RiskEvaluation {
  isHighRisk: boolean;
  riskScore: number;
  thresholdsExceeded: string[];
  riskFactors: string[];
  recommendedAction: string;
  urgency: 'Immediate' | 'Monitor' | 'None';
}

export interface RiskThresholds {
  phq9HighRisk: number;
  phq9Critical: number;
  stressIndexHigh: number;
  spo2Critical: number;
  hrvCritical: number;
  sleepHoursCritical: number;
  sleepQualityLow: number;
  recoveryScoreLow: number;
  wearableRiskScore: number;
}

const DEFAULT_THRESHOLDS: RiskThresholds = {
  phq9HighRisk: 15,       // PHQ-9 > 14 triggers de-anonymization
  phq9Critical: 20,       // PHQ-9 >= 20 is critical
  stressIndexHigh: 70,    // stressIndex > 70 is high
  spo2Critical: 90,       // SpO2 below 90 is critical (altitude/hypoxia)
  hrvCritical: 35,        // HRV below 35 ms is clinical concern
  sleepHoursCritical: 4,  // < 4 hours sleep
  sleepQualityLow: 40,    // sleepQuality < 40
  recoveryScoreLow: 30,   // recoveryScore < 30
  wearableRiskScore: 65,  // aggregate wearable risk score > 65
};

// Voice NLP lexical markers for self-harm / high-stress indicators
const SELF_HARM_MARKERS = [
  'suicide', 'suicidal', 'kill myself', 'want to die', 'better off dead',
  'end it all', 'no way out', 'cant go on', "can't go on", 'give up',
  'not worth living', 'wish i was dead', 'hurting myself', 'self harm',
  'cut myself', 'need to disappear', 'no reason to live',
  'dont want to wake up', "don't want to wake up",
];

const HIGH_STRESS_MARKERS = [
  'overwhelmed', 'breaking down', 'cant cope', "can't cope", 'losing it',
  'panic attack', 'anxiety attack', 'cant breathe', "can't breathe",
  'depersonalization', 'derealization', 'feeling numb', 'emotional blunting',
  'thoughts racing', 'hypervigilant', 'on edge', 'shaking',
  'heart racing', 'cant focus', "can't focus", 'brain fog',
];

const OPERATIONAL_STRESS_MARKERS = [
  'exhausted', 'drained', ' burnt out', 'burnout', 'no energy',
  'cant think straight', "can't think straight", 'nightmares',
  'hypervigilant', 'startle response', 'irritable', 'angry all the time',
  'isolated', 'alone', 'cut off', 'no support', 'no one understands',
  'pressure', 'constant pressure', 'too much', 'cant handle',
];

function evaluateVoiceTranscript(transcript: string): {
  selfHarmRisk: boolean;
  highStressRisk: boolean;
  operationalStressRisk: boolean;
  matchedMarkers: string[];
} {
  const lowerTranscript = transcript.toLowerCase();
  const matchedMarkers: string[] = [];

  const selfHarmMatch = SELF_HARM_MARKERS.some((marker) => {
    if (lowerTranscript.includes(marker)) {
      matchedMarkers.push(marker);
      return true;
    }
    return false;
  });

  const highStressMatch = HIGH_STRESS_MARKERS.some((marker) => {
    if (lowerTranscript.includes(marker)) {
      matchedMarkers.push(marker);
      return true;
    }
    return false;
  });

  const operationalStressMatch = OPERATIONAL_STRESS_MARKERS.some((marker) => {
    if (lowerTranscript.includes(marker)) {
      matchedMarkers.push(marker);
      return true;
    }
    return false;
  });

  return {
    selfHarmRisk: selfHarmMatch,
    highStressRisk: highStressMatch,
    operationalStressRisk: operationalStressMatch,
    matchedMarkers: [...new Set(matchedMarkers)],
  };
}

export function evaluatePHQ9(score: number, thresholds: Partial<RiskThresholds> = {}): RiskEvaluation {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const thresholdsExceeded: string[] = [];
  const riskFactors: string[] = [];

  if (score > t.phq9HighRisk - 1) {
    thresholdsExceeded.push(`PHQ-9 score ${score} exceeds threshold of ${t.phq9HighRisk - 1}`);
    riskFactors.push('Clinical depression screening elevated');
  }

  if (score >= t.phq9Critical) {
    thresholdsExceeded.push(`PHQ-9 score ${score} exceeds critical threshold of ${t.phq9Critical}`);
    riskFactors.push('Critical depression severity');
  }

  const riskScore = score * 5; // scale to 0-100
  const isHighRisk = score > t.phq9HighRisk - 1;

  let recommendedAction = 'Continue monitoring';
  let urgency: 'Immediate' | 'Monitor' | 'None' = 'None';

  if (score >= t.phq9Critical) {
    recommendedAction = 'Immediate clinical intervention - de-anonymize for Medical Officer triage';
    urgency = 'Immediate';
  } else if (score > t.phq9HighRisk - 1) {
    recommendedAction = 'Escalate to Medical Officer - de-anonymized risk assessment';
    urgency = 'Monitor';
  }

  return { isHighRisk, riskScore, thresholdsExceeded, riskFactors, recommendedAction, urgency };
}

export function evaluateWearable(
  telemetry: WearableTelemetry,
  thresholds: Partial<RiskThresholds> = {}
): RiskEvaluation {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const thresholdsExceeded: string[] = [];
  const riskFactors: string[] = [];

  if (telemetry.stressIndex > t.stressIndexHigh) {
    thresholdsExceeded.push(`Stress index ${telemetry.stressIndex} exceeds ${t.stressIndexHigh}`);
    riskFactors.push('Elevated operational stress');
  }

  if (telemetry.spo2 < t.spo2Critical) {
    thresholdsExceeded.push(`SpO2 ${telemetry.spo2}% below ${t.spo2Critical}% threshold`);
    riskFactors.push('Hypoxia risk');
  }

  if (telemetry.hrv < t.hrvCritical) {
    thresholdsExceeded.push(`HRV ${telemetry.hrv}ms below ${t.hrvCritical}ms threshold`);
    riskFactors.push('Autonomic dysregulation');
  }

  if (telemetry.sleepHours < t.sleepHoursCritical) {
    thresholdsExceeded.push(`Sleep ${telemetry.sleepHours}h below ${t.sleepHoursCritical}h threshold`);
    riskFactors.push('Severe sleep deficit');
  }

  if (telemetry.sleepQuality < t.sleepQualityLow) {
    thresholdsExceeded.push(`Sleep quality ${telemetry.sleepQuality}/100 below ${t.sleepQualityLow}`);
    riskFactors.push('Poor sleep quality');
  }

  if (telemetry.recoveryScore < t.recoveryScoreLow) {
    thresholdsExceeded.push(`Recovery score ${telemetry.recoveryScore}/100 below ${t.recoveryScoreLow}`);
    riskFactors.push('Impaired recovery');
  }

  const riskScore = thresholdsExceeded.length * 25;
  const isHighRisk = riskScore >= t.wearableRiskScore;

  let recommendedAction = 'Continue routine monitoring';
  let urgency: 'Immediate' | 'Monitor' | 'None' = 'None';

  if (telemetry.spo2 < 88) {
    recommendedAction = 'Immediate medical evacuation protocol';
    urgency = 'Immediate';
  } else if (isHighRisk) {
    recommendedAction = 'Flag for Medical Officer wellness check';
    urgency = 'Monitor';
  }

  return { isHighRisk, riskScore, thresholdsExceeded, riskFactors, recommendedAction, urgency };
}

export function evaluateVoice(
  transcript: string,
  userId: string,
  unit?: string,
  location?: string,
  thresholds: Partial<RiskThresholds> = {}
): { evaluation: RiskEvaluation; flags: string[] } {
  const { selfHarmRisk, highStressRisk, operationalStressRisk, matchedMarkers } =
    evaluateVoiceTranscript(transcript);

  const riskFactors: string[] = [];
  const thresholdsExceeded: string[] = [];

  if (selfHarmRisk) {
    riskFactors.push('Self-harm ideation detected in voice transcript');
    thresholdsExceeded.push('Self-harm lexical markers matched');
  }

  if (highStressRisk) {
    riskFactors.push('High stress / panic indicators detected');
    thresholdsExceeded.push('Stress-related lexical markers matched');
  }

  if (operationalStressRisk) {
    riskFactors.push('Operational stress / burnout indicators detected');
    thresholdsExceeded.push('Operational stress markers matched');
  }

  const riskScore = matchedMarkers.length * 20;
  const isHighRisk = selfHarmRisk || riskScore >= 40;

  let recommendedAction = 'Continue monitoring voice patterns';
  let urgency: 'Immediate' | 'Monitor' | 'None' = 'None';

  if (selfHarmRisk) {
    recommendedAction = 'IMMEDIATE de-anonymization - trigger Medical Officer emergency intervention';
    urgency = 'Immediate';
  } else if (highStressRisk || operationalStressRisk) {
    recommendedAction = 'Schedule confidential wellness check-in';
    urgency = 'Monitor';
  }

  return {
    evaluation: {
      isHighRisk,
      riskScore,
      thresholdsExceeded,
      riskFactors,
      recommendedAction,
      urgency,
    },
    flags: matchedMarkers,
  };
}

export function createRiskAlert(
  userId: string,
  userName: string,
  serviceNumber: string,
  anonymizedId: string,
  unit: string,
  location: string,
  riskType: 'phq9' | 'voice_nlp' | 'wearable',
  riskScore: number,
  thresholdExceed: string,
  riskFactors: string[]
): RiskAlert {
  return {
    id: `ra-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    userId,
    userName,
    serviceNumber,
    anonymizedId,
    unit,
    location,
    riskType,
    riskScore,
    thresholdExceed,
    triggeredAt: new Date().toISOString(),
    acknowledged: false,
  };
}

export function createTelemetryEvent(
  eventType: SystemTelemetry['eventType'],
  eventDetail: string,
  triggeredBy?: string,
  thresholdValue?: number,
  actualValue?: number
): SystemTelemetry {
  return {
    id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    eventType,
    eventDetail,
    triggeredBy,
    thresholdValue,
    actualValue,
    timestamp: new Date().toISOString(),
  };
}

export { DEFAULT_THRESHOLDS, SELF_HARM_MARKERS, HIGH_STRESS_MARKERS, OPERATIONAL_STRESS_MARKERS };

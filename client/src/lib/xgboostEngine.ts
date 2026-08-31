/**
 * XGBoost-style Gradient Boosted Decision Trees for CAPF welfare risk scoring.
 * Second-order (gradient + hessian) GBDT with shrinkage — same algorithm used on client and server.
 */

export interface WelfareFeatures {
  meanAnswer: number;
  sleepLoad: number;
  burnoutLoad: number;
  cognitiveLoad: number;
  safetyLoad: number;
  heartRate: number;
  spo2: number;
  hrv: number;
  shiftHours: number;
  sleepDeficit: number;
  consecutiveDays: number;
  altitude: number;
}

export interface XGBoostPrediction {
  stressScore: number;
  riskBand: 'Low' | 'Moderate' | 'High' | 'Critical';
  hrvDropPct: number;
  fatigueProbability: number;
  featureContributions: { name: string; impact: number }[];
  model: string;
  trees: number;
  latencyMs: number;
}

type Vec = number[];

interface TreeNode {
  feat?: number;
  thr?: number;
  left?: TreeNode;
  right?: TreeNode;
  val?: number;
}

const FEATURE_NAMES = [
  'Survey mean',
  'Sleep load',
  'Burnout load',
  'Cognitive load',
  'Safety load',
  'Heart rate',
  'SpO2',
  'HRV',
  'Shift hours',
  'Sleep deficit',
  'Consecutive days',
  'High altitude',
];

function toVec(f: WelfareFeatures): Vec {
  return [
    f.meanAnswer,
    f.sleepLoad,
    f.burnoutLoad,
    f.cognitiveLoad,
    f.safetyLoad,
    f.heartRate,
    f.spo2,
    f.hrv,
    f.shiftHours,
    f.sleepDeficit,
    f.consecutiveDays,
    f.altitude,
  ];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function seeded(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function syntheticTarget(v: Vec): number {
  const mean = v[0];
  const sleep = v[1];
  const burnout = v[2];
  const cog = v[3];
  const safety = v[4];
  const hr = v[5];
  const spo2 = v[6];
  const hrv = v[7];
  const hours = v[8];
  const deficit = v[9];
  const days = v[10];
  const alt = v[11];

  let score =
    mean * 14 +
    sleep * 8 +
    burnout * 10 +
    cog * 7 +
    safety * 5 +
    ((hr - 60) / 40) * 12 +
    ((98 - spo2) / 8) * 14 +
    ((70 - hrv) / 50) * 16 +
    ((hours - 36) / 36) * 18 +
    deficit * 6 +
    (days / 14) * 10 +
    alt * 11;
  return clamp(score, 4, 97);
}

function makeDataset(n = 720): { X: Vec[]; y: number[] } {
  const X: Vec[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = (k: number) => seeded(i * 17 + k);
    const v: Vec = [
      r(1) * 3,
      r(2) * 3,
      r(3) * 3,
      r(4) * 3,
      r(5) * 3,
      54 + r(6) * 42,
      90 + r(7) * 9,
      28 + r(8) * 62,
      24 + r(9) * 50,
      r(10) * 6,
      1 + r(11) * 13,
      r(12) > 0.55 ? 1 : 0,
    ];
    X.push(v);
    y.push(syntheticTarget(v) + (r(13) - 0.5) * 4);
  }
  return { X, y };
}

function evalTree(node: TreeNode, x: Vec): number {
  if (node.val !== undefined && node.feat === undefined) return node.val;
  if (node.feat === undefined || node.thr === undefined) return node.val ?? 0;
  const goLeft = x[node.feat] <= node.thr;
  return evalTree(goLeft ? node.left! : node.right!, x);
}

function bestSplit(X: Vec[], g: number[], h: number[], idx: number[], lambda = 1): { feat: number; thr: number; gain: number } | null {
  let best: { feat: number; thr: number; gain: number } | null = null;
  const n = idx.length;
  if (n < 8) return null;

  let G = 0;
  let H = 0;
  for (const i of idx) {
    G += g[i];
    H += h[i];
  }
  const parentScore = (G * G) / (H + lambda);

  for (let f = 0; f < 12; f++) {
    const sorted = [...idx].sort((a, b) => X[a][f] - X[b][f]);
    let GL = 0;
    let HL = 0;
    for (let k = 0; k < n - 1; k++) {
      const i = sorted[k];
      GL += g[i];
      HL += h[i];
      const GR = G - GL;
      const HR = H - HL;
      if (HL < 1e-6 || HR < 1e-6) continue;
      if (X[sorted[k]][f] === X[sorted[k + 1]][f]) continue;
      const gain = (GL * GL) / (HL + lambda) + (GR * GR) / (HR + lambda) - parentScore;
      if (!best || gain > best.gain) {
        best = { feat: f, thr: (X[sorted[k]][f] + X[sorted[k + 1]][f]) / 2, gain };
      }
    }
  }
  if (!best || best.gain < 1e-4) return null;
  return best;
}

function leafValue(idx: number[], g: number[], h: number[], lambda = 1) {
  let G = 0;
  let H = 0;
  for (const i of idx) {
    G += g[i];
    H += h[i];
  }
  return -G / (H + lambda);
}

function buildTree(X: Vec[], g: number[], h: number[], idx: number[], depth: number, maxDepth: number): TreeNode {
  if (depth >= maxDepth || idx.length < 8) {
    return { val: leafValue(idx, g, h) };
  }
  const split = bestSplit(X, g, h, idx);
  if (!split) return { val: leafValue(idx, g, h) };
  const leftIdx = idx.filter((i) => X[i][split.feat] <= split.thr);
  const rightIdx = idx.filter((i) => X[i][split.feat] > split.thr);
  if (leftIdx.length === 0 || rightIdx.length === 0) return { val: leafValue(idx, g, h) };
  return {
    feat: split.feat,
    thr: split.thr,
    left: buildTree(X, g, h, leftIdx, depth + 1, maxDepth),
    right: buildTree(X, g, h, rightIdx, depth + 1, maxDepth),
  };
}

const N_TREES = 36;
const LR = 0.12;
const MAX_DEPTH = 4;

let TREES: TreeNode[] | null = null;
let BASE = 0;

function train() {
  const { X, y } = makeDataset();
  const n = y.length;
  BASE = y.reduce((a, b) => a + b, 0) / n;
  const pred = new Array(n).fill(BASE);
  TREES = [];
  for (let t = 0; t < N_TREES; t++) {
    const g = pred.map((p, i) => p - y[i]);
    const h = new Array(n).fill(1);
    const idx = Array.from({ length: n }, (_, i) => i);
    const tree = buildTree(X, g, h, idx, 0, MAX_DEPTH);
    TREES.push(tree);
    for (let i = 0; i < n; i++) pred[i] += LR * evalTree(tree, X[i]);
  }
}

function ensureModel() {
  if (!TREES) train();
}

function contribApprox(x: Vec, score: number) {
  const names = FEATURE_NAMES;
  const impacts: { name: string; impact: number }[] = [];
  const weights = [0.18, 0.1, 0.14, 0.09, 0.07, 0.08, 0.08, 0.12, 0.1, 0.08, 0.06, 0.07];
  const norms = [
    x[0] / 3,
    x[1] / 3,
    x[2] / 3,
    x[3] / 3,
    x[4] / 3,
    clamp((x[5] - 58) / 40, 0, 1),
    clamp((98 - x[6]) / 8, 0, 1),
    clamp((72 - x[7]) / 50, 0, 1),
    clamp((x[8] - 36) / 36, 0, 1),
    x[9] / 6,
    x[10] / 14,
    x[11],
  ];
  for (let i = 0; i < 12; i++) {
    impacts.push({ name: names[i], impact: Number((norms[i] * weights[i] * score).toFixed(1)) });
  }
  return impacts.sort((a, b) => b.impact - a.impact).slice(0, 6);
}

export function predictXGBoost(features: Partial<WelfareFeatures>): XGBoostPrediction {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  ensureModel();
  const f: WelfareFeatures = {
    meanAnswer: features.meanAnswer ?? 1,
    sleepLoad: features.sleepLoad ?? 1,
    burnoutLoad: features.burnoutLoad ?? 1,
    cognitiveLoad: features.cognitiveLoad ?? 1,
    safetyLoad: features.safetyLoad ?? 1,
    heartRate: features.heartRate ?? 72,
    spo2: features.spo2 ?? 97,
    hrv: features.hrv ?? 58,
    shiftHours: features.shiftHours ?? 44,
    sleepDeficit: features.sleepDeficit ?? 1.5,
    consecutiveDays: features.consecutiveDays ?? 5,
    altitude: features.altitude ?? 0,
  };
  const x = toVec(f);
  let pred = BASE;
  for (const tree of TREES!) pred += LR * evalTree(tree, x);
  const stressScore = Math.round(clamp(pred, 5, 98));
  const riskBand: XGBoostPrediction['riskBand'] =
    stressScore >= 80 ? 'Critical' : stressScore >= 62 ? 'High' : stressScore >= 38 ? 'Moderate' : 'Low';
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    stressScore,
    riskBand,
    hrvDropPct: Math.round(clamp(stressScore * 0.42, 4, 48)),
    fatigueProbability: Math.round(clamp(stressScore * 0.92 + (f.altitude ? 6 : 0), 8, 97)),
    featureContributions: contribApprox(x, stressScore),
    model: 'XGBoost GBDT (36 trees, depth 4, η=0.12)',
    trees: N_TREES,
    latencyMs: Number(Math.max(1, t1 - t0).toFixed(2)),
  };
}

export function featuresFromAssessment(input: {
  answers?: Record<string, number>;
  questions?: { id: string; category: string }[];
  wearable?: { heartRate?: number; spo2?: number; hrv?: number };
  ops?: { shiftHours?: number; sleepDeficit?: number; consecutiveDays?: number; altitude?: boolean };
}): WelfareFeatures {
  const answers = input.answers || {};
  const qs = input.questions || [];
  const vals = Object.values(answers);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 1;

  const avgCat = (needle: string) => {
    const ids = qs.filter((q) => q.category.toLowerCase().includes(needle)).map((q) => q.id);
    const picked = ids.map((id) => answers[id]).filter((v) => v !== undefined);
    if (!picked.length) return mean;
    return picked.reduce((a, b) => a + b, 0) / picked.length;
  };

  return {
    meanAnswer: mean,
    sleepLoad: avgCat('sleep') || avgCat('circadian'),
    burnoutLoad: avgCat('burnout') || avgCat('emotional'),
    cognitiveLoad: avgCat('cognitive') || avgCat('focus'),
    safetyLoad: avgCat('safety') || avgCat('psych'),
    heartRate: input.wearable?.heartRate ?? 72,
    spo2: input.wearable?.spo2 ?? 97,
    hrv: input.wearable?.hrv ?? 58,
    shiftHours: input.ops?.shiftHours ?? 44,
    sleepDeficit: input.ops?.sleepDeficit ?? 1.5,
    consecutiveDays: input.ops?.consecutiveDays ?? 5,
    altitude: input.ops?.altitude ? 1 : 0,
  };
}

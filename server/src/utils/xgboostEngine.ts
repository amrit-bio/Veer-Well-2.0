/**
 * XGBoost-style Gradient Boosted Decision Trees for CAPF welfare risk scoring.
 * Second-order (gradient + hessian) GBDT with shrinkage.
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
  let score =
    v[0] * 14 +
    v[1] * 8 +
    v[2] * 10 +
    v[3] * 7 +
    v[4] * 5 +
    ((v[5] - 60) / 40) * 12 +
    ((98 - v[6]) / 8) * 14 +
    ((70 - v[7]) / 50) * 16 +
    ((v[8] - 36) / 36) * 18 +
    v[9] * 6 +
    (v[10] / 14) * 10 +
    v[11] * 11;
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
  return FEATURE_NAMES.map((name, i) => ({
    name,
    impact: Number((norms[i] * weights[i] * score).toFixed(1)),
  }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 6);
}

export function predictXGBoost(features: Partial<WelfareFeatures>): XGBoostPrediction {
  const t0 = Date.now();
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
  return {
    stressScore,
    riskBand,
    hrvDropPct: Math.round(clamp(stressScore * 0.42, 4, 48)),
    fatigueProbability: Math.round(clamp(stressScore * 0.92 + (f.altitude ? 6 : 0), 8, 97)),
    featureContributions: contribApprox(x, stressScore),
    model: 'XGBoost GBDT (36 trees, depth 4, η=0.12)',
    trees: N_TREES,
    latencyMs: Math.max(1, Date.now() - t0),
  };
}

export function warmXGBoost() {
  ensureModel();
}

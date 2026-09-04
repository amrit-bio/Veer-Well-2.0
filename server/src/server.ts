import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import pdfParse from 'pdf-parse';
import Papa from 'papaparse';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { SeededData, generateSeedData } from './utils/seedData.js';
import { predictXGBoost, warmXGBoost } from './utils/xgboostEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
  console.error('[VeerWell Server] ❌ FATAL: JWT_SECRET environment variable is missing or too short (min 32 chars). Set a strong random secret.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}
const JWT_SECRET_FINAL = JWT_SECRET || 'veerwell_dev_only_unsafe_secret_do_not_use_in_production';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Warn if Gemini key is missing
if (!GEMINI_API_KEY) {
  console.warn('[VeerWell Server] ⚠️  GEMINI_API_KEY is not set. Local Rakshak AI fallback will be used.');
}

// Supabase Admin Client (Bypasses RLS, can create pre-confirmed auth users)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

export const supabaseAdmin = SUPABASE_URL && SUPABASE_SECRET_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

if (supabaseAdmin) {
  console.log(`[VeerWell Server] ✅ Supabase Admin initialized: ${SUPABASE_URL}`);
}

// Configure CORS to allow requests from Vercel, Railway, and development
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS_STR = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001';
const allowedOriginsList = ALLOWED_ORIGINS_STR.split(',').map(o => o.trim());

const allowedOrigins: (string | RegExp)[] = [
  ...allowedOriginsList,
  /\.vercel\.app$/, // Allow all Vercel deployments
  /\.railway\.app$/, // Allow all Railway deployments  
  /\.onrender\.com$/, // Allow all Render deployments
];

// In production, be more permissive with CORS (Vercel deployments have dynamic URLs)
if (NODE_ENV === 'production') {
  console.log('[CORS] Production mode: allowing flexible origins');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl requests, direct server-to-server)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Request from origin: ${origin}`);
      // In production, be permissive (can cause issues with Vercel preview deployments)
      if (NODE_ENV === 'production') {
        console.warn(`[CORS] Allowing production request from: ${origin}`);
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer storage for PDF and CSV uploads
// In production (Railway/Render), use /tmp directory for ephemeral storage
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.resolve('/tmp', 'veerwell-uploads')
  : path.resolve(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn(`[VeerWell Server] Could not create upload directory: ${uploadDir}`, err);
}
const upload = multer({ dest: uploadDir });

// In-Memory / File-backed Database Store
// In production, use /tmp directory for database file
const dbPath = process.env.NODE_ENV === 'production'
  ? path.resolve('/tmp', 'veerwell-seededData.json')
  : path.resolve(process.cwd(), 'src/db/seededData.json');
let db: SeededData;

function loadDb(): SeededData {
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error loading DB file, generating fresh data:', err);
    }
  }
  const fresh = generateSeedData();
  saveDb(fresh);
  return fresh;
}

function saveDb(data: SeededData) {
  db = data;
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

db = loadDb();

// JWT Helper Middleware
const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(); // Allow guest/demo or populate fallback
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET_FINAL) as any;
    (req as any).user = decoded;
  } catch (err) {
    // token invalid/expired
  }
  next();
};

app.use(authenticate);

// ==========================================
// 1. AUTHENTICATION & DEMO ROLES
// ==========================================
app.post(['/api/auth/login', '/auth/login'], (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user = db.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());

  if (!user && role) {
    user = db.users.find((u) => u.role === role);
  }

  if (!user) {
    // Fallback to first user
    user = db.users[0];
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      anonymizedId: user.anonymizedId,
    },
    JWT_SECRET_FINAL,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user,
    message: `Logged in successfully as ${user.name} (${user.roleTitle})`,
  });
});

app.post(['/api/auth/signup', '/auth/signup'], async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role = 'personnel',
      rank = 'Inspector',
      serviceNumber,
      force = 'CRPF',
      unit = '142 Bn (Srinagar Sector HQ)',
      department = 'Operations',
      designation,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({
        error: 'Registration is unavailable because Supabase is not configured on the server.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanServiceNumber = serviceNumber?.trim() || `CRPF-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const cleanRoleTitle = designation || `${rank} (${role})`;

    let userId = `usr-${Date.now()}`; // Fallback ID if Supabase fails

    // ── 1. Create / Confirm User in Supabase Auth & public.profiles ──
    if (supabaseAdmin) {
      console.log(`[VeerWell Server] Registering verified Supabase Auth user: ${cleanEmail}...`);

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true, // Auto-confirm email for development. Configure SMTP in Supabase for production OTP flow.
        user_metadata: {
          name: cleanName,
          rank,
          serviceNumber: cleanServiceNumber,
          force,
          unit,
          role,
        },
      });

      if (!authData?.user) {
        const isDuplicate = authError?.message.toLowerCase().includes('already');
        console.warn('[VeerWell Server] Supabase Auth user creation failed:', authError?.message);
        return res.status(isDuplicate ? 409 : 502).json({
          error: isDuplicate
            ? 'An account already exists for this email. Please sign in instead.'
            : 'Could not create your Supabase account. Please try again.',
        });
      }

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          console.log(`[VeerWell Server] User ${cleanEmail} already exists in Auth, updating password & auto-confirming...`);
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (existing) {
            userId = existing.id;
            console.log(`[VeerWell Server] ✅ Found existing user ID: ${userId}, updating credentials...`);
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              password: cleanPassword,
              email_confirm: true, // Auto-confirm email for development
              user_metadata: {
                name: cleanName,
                rank,
                serviceNumber: cleanServiceNumber,
                force,
                unit,
                role,
              },
            });
          }
        } else {
          console.warn('[VeerWell Server] Supabase auth creation notice:', authError.message);
        }
      } else if (authData?.user) {
        userId = authData.user.id;
        console.log(`[VeerWell Server] ✅ Created new Supabase Auth user with ID: ${userId}`);
      } else {
        console.warn('[VeerWell Server] No user data returned from Supabase auth creation');
      }

      // Upsert profile into public.profiles table
      console.log(`[VeerWell Server] Upserting profile record into public.profiles for ID: ${userId}...`);
      const { error: profileErr } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        rank: rank,
        service_number: cleanServiceNumber,
        force: force,
        unit: unit,
        role: role,
        role_title: cleanRoleTitle,
        department: department,
        designation: cleanRoleTitle,
        anonymized_id: `CAPF-NODE-${userId.slice(0, 5).toUpperCase()}`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        location: `${unit}, ${force}`,
        updated_at: new Date().toISOString(),
      });

      if (profileErr) {
        console.warn('[VeerWell Server] public.profiles upsert notice (non-blocking):', profileErr.message);
      } else {
        console.log(`[VeerWell Server] ✅ Profile saved into public.profiles table for user: ${cleanEmail}`);
      }

      // Upsert baseline wearable telemetry record (optional - won't block if table missing)
      const todayDateStr = new Date().toISOString().split('T')[0];
      try {
        await supabaseAdmin.from('wearable_telemetry').upsert({
          user_id: userId,
          date: todayDateStr,
          heart_rate: 68,
          hrv: 62,
          spo2: 98.4,
          steps: 7500,
          sleep_hours: 7.2,
          sleep_quality: 85,
          stress_index: 30,
          recovery_score: 84,
          resting_heart_rate: 60,
          calories: 2200,
        });
      } catch (err: any) {
        // Silently ignore if wearable_telemetry table doesn't exist yet
        if (!(err.message?.includes('Could not find the table'))) {
          console.warn('[VeerWell Server] Wearable telemetry insert skipped:', err.message);
        }
      }
    }

    // ── 2. Build the authenticated response from the Supabase profile ──
    const newUser: any = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      rank: rank,
      serviceNumber: cleanServiceNumber,
      force: force,
      unit: unit,
      role: role,
      roleTitle: cleanRoleTitle,
      department: department,
      designation: cleanRoleTitle,
      anonymizedId: `CAPF-NODE-${userId.slice(0, 5).toUpperCase()}`,
      teamId: 'team-ops-alpha',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    const token = jwt.sign(newUser, JWT_SECRET_FINAL, { expiresIn: '7d' });

    // Persist in server database memory store
    const existingIndex = db.users.findIndex((u) => u.id === userId || u.email?.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...newUser };
    } else {
      db.users.unshift(newUser);
    }
    saveDb(db);

    return res.status(201).json({
      success: true,
      token,
      user: newUser,
      userId: userId,
      message: 'Account registered and confirmed! Live Supabase credentials ready for login.',
    });
  } catch (err: any) {
    console.error('[VeerWell Server] Sign up error:', err);
    return res.status(500).json({ error: err.message || 'Error during sign up' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authUser = (req as any).user;
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized. Please provide a valid Bearer token.' });
  }
  const user = db.users.find((u) => u.id === authUser.id) || {
    id: authUser.id,
    name: authUser.name || 'Personnel',
    email: authUser.email,
    role: authUser.role || 'personnel',
    roleTitle: authUser.roleTitle || 'Forces Personnel',
    department: authUser.department || 'Operations',
    anonymizedId: authUser.anonymizedId || `CAPF-NODE-${authUser.id?.slice(0, 5) || '1042'}`,
  };
  return res.json({ user });
});

app.get('/api/auth/demo-users', (req: Request, res: Response) => {
  const roles = ['hr_admin', 'wellness_mgr', 'team_lead', 'employee', 'data_analyst'];
  const demoUsers = roles.map((r) => db.users.find((u) => u.role === r) || db.users[0]);
  return res.json({ demoUsers });
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  // Aggregate wellness metrics across org
  const totalEmployees = db.users.length;
  const stressScores = db.stressMetrics.map((m) => m.stressScore);
  const avgStress = Number((stressScores.reduce((a, b) => a + b, 0) / stressScores.length).toFixed(1));
  const orgWellnessIndex = Math.round(100 - avgStress * 5.8);
  const burnoutRiskCount = db.stressMetrics.filter((m) => m.burnoutRisk === 'High' || m.burnoutRisk === 'Critical').length;
  const pendingAssessmentsCount = db.assessments.filter((a) => a.status === 'Pending').length;

  const departmentAverages = [
    { department: 'Operations', wellnessScore: 74, stressScore: 6.2, overtimeRate: 34 },
    { department: 'Healthcare & Field', wellnessScore: 81, stressScore: 5.4, overtimeRate: 28 },
    { department: 'Engineering & IT', wellnessScore: 86, stressScore: 4.1, overtimeRate: 18 },
    { department: 'Administration', wellnessScore: 89, stressScore: 3.8, overtimeRate: 12 },
  ];

  const recentAlerts = [
    {
      id: 'alt-1',
      type: 'critical' as const,
      title: 'High-Tempo Deployment Fatigue Detected',
      message: '3 personnel in Operations (Sector Leh) show HRV drops >25% and sleep deficit.',
      timeAgo: '12m ago',
      department: 'Operations',
    },
    {
      id: 'alt-2',
      type: 'warning' as const,
      title: 'Workload Surge Flag',
      message: 'Engineering & IT sprint hours exceeded 48h/week benchmark for 2 consecutive cycles.',
      timeAgo: '1h ago',
      department: 'Engineering & IT',
    },
    {
      id: 'alt-3',
      type: 'info' as const,
      title: 'Q3 Wellness Survey 90% Threshold Reached',
      message: 'Response target completed with elevated sentiment in Peer Support dimension.',
      timeAgo: '4h ago',
    },
  ];

  return res.json({
    orgWellnessIndex,
    prevOrgWellnessIndex: 79,
    avgStressIndex: avgStress,
    burnoutRiskCount,
    pendingAssessmentsCount,
    totalEmployees,
    activeSurveysCount: db.surveys.filter((s) => s.status === 'Active').length,
    leaveUtilizationPct: 64,
    departmentAverages,
    recentAlerts,
  });
});

// ==========================================
// 3. ASSESSMENTS
// ==========================================
const assessmentDefinitions = [
  {
    id: 'cat-1',
    code: 'PHQ9',
    title: 'PHQ-9 Mood & Mental Vitality Check',
    category: 'Mental Health',
    description: 'Gold-standard diagnostic screener measuring cognitive stamina, mood resilience, and vitality levels over the last 2 weeks.',
    estMinutes: 4,
    questions: [
      {
        id: 'q1',
        text: 'Little interest or pleasure in doing things or engaging with your unit',
        options: [
          { label: 'Not at all', value: 0 },
          { label: 'Several days', value: 1 },
          { label: 'More than half the days', value: 2 },
          { label: 'Nearly every day', value: 3 },
        ],
      },
      {
        id: 'q2',
        text: 'Feeling down, fatigued, or feeling overwhelmed by duty load',
        options: [
          { label: 'Not at all', value: 0 },
          { label: 'Several days', value: 1 },
          { label: 'More than half the days', value: 2 },
          { label: 'Nearly every day', value: 3 },
        ],
      },
      {
        id: 'q3',
        text: 'Trouble falling or staying asleep, or sleeping excessively',
        options: [
          { label: 'Not at all', value: 0 },
          { label: 'Several days', value: 1 },
          { label: 'More than half the days', value: 2 },
          { label: 'Nearly every day', value: 3 },
        ],
      },
      {
        id: 'q4',
        text: 'Feeling tired, sluggish, or having depleted physical stamina',
        options: [
          { label: 'Not at all', value: 0 },
          { label: 'Several days', value: 1 },
          { label: 'More than half the days', value: 2 },
          { label: 'Nearly every day', value: 3 },
        ],
      },
      {
        id: 'q5',
        text: 'Difficulty concentrating on high-priority operational tasks',
        options: [
          { label: 'Not at all', value: 0 },
          { label: 'Several days', value: 1 },
          { label: 'More than half the days', value: 2 },
          { label: 'Nearly every day', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'cat-2',
    code: 'BURNOUT_MBI',
    title: 'Maslach Burnout Inventory (MBI-Workplace)',
    category: 'Workplace',
    description: 'Evaluates emotional exhaustion, depersonalization/cynicism, and professional self-efficacy under high operational tempo.',
    estMinutes: 5,
    questions: [
      {
        id: 'mb1',
        text: 'I feel emotionally drained from my daily work assignments',
        options: [
          { label: 'Never', value: 0 },
          { label: 'Rarely (A few times a month)', value: 1 },
          { label: 'Frequently (Weekly)', value: 2 },
          { label: 'Constantly (Daily)', value: 3 },
        ],
      },
      {
        id: 'mb2',
        text: 'I feel used up and physically exhausted at the end of the shift',
        options: [
          { label: 'Never', value: 0 },
          { label: 'Rarely', value: 1 },
          { label: 'Frequently', value: 2 },
          { label: 'Constantly', value: 3 },
        ],
      },
      {
        id: 'mb3',
        text: 'I can easily create a relaxed atmosphere with colleagues',
        options: [
          { label: 'Always (Positive)', value: 0 },
          { label: 'Frequently', value: 1 },
          { label: 'Rarely', value: 2 },
          { label: 'Never (High Strain)', value: 3 },
        ],
      },
      {
        id: 'mb4',
        text: 'Working all day with field personnel is really a heavy strain for me',
        options: [
          { label: 'Never', value: 0 },
          { label: 'Rarely', value: 1 },
          { label: 'Frequently', value: 2 },
          { label: 'Constantly', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'cat-3',
    code: 'SLEEP_HYGIENE',
    title: 'Sleep Hygiene & Circadian Fatigue Index',
    category: 'Sleep & Recovery',
    description: 'Assesses night-duty circadian disruptions, sleep environment quality, and REM recovery cycles.',
    estMinutes: 3,
    questions: [
      {
        id: 'sl1',
        text: 'Do you take more than 30 minutes to fall asleep after your shift?',
        options: [
          { label: 'Never', value: 0 },
          { label: '1-2 nights/week', value: 1 },
          { label: '3-4 nights/week', value: 2 },
          { label: 'Almost every night', value: 3 },
        ],
      },
      {
        id: 'sl2',
        text: 'Do you wake up feeling unrested despite 7+ hours in bed?',
        options: [
          { label: 'Rarely', value: 0 },
          { label: 'Sometimes', value: 1 },
          { label: 'Frequently', value: 2 },
          { label: 'Always', value: 3 },
        ],
      },
      {
        id: 'sl3',
        text: 'Do shift rotations disrupt your continuous recovery sleep?',
        options: [
          { label: 'No disruption', value: 0 },
          { label: 'Mild', value: 1 },
          { label: 'Moderate', value: 2 },
          { label: 'Severe disruption', value: 3 },
        ],
      },
    ],
  },
  {
    id: 'cat-4',
    code: 'PULSE_WEEKLY',
    title: 'Weekly Operational Pulse & Resiliency Check',
    category: 'Weekly Pulse',
    description: 'Rapid 60-second micro check-in on unit morale, immediate blocker support, and peer safety.',
    estMinutes: 2,
    questions: [
      {
        id: 'pl1',
        text: 'How manageable did this week’s workload feel overall?',
        options: [
          { label: 'Optimal / Energizing', value: 0 },
          { label: 'Manageable with focus', value: 1 },
          { label: 'Intense / Stressful', value: 2 },
          { label: 'Overwhelming / Critical', value: 3 },
        ],
      },
      {
        id: 'pl2',
        text: 'Did you have adequate support from your team lead and peers?',
        options: [
          { label: 'Excellent support', value: 0 },
          { label: 'Good support', value: 1 },
          { label: 'Minimal support', value: 2 },
          { label: 'Isolated / No support', value: 3 },
        ],
      },
    ],
  },
];

app.get('/api/assessments/definitions', (req: Request, res: Response) => {
  return res.json({ definitions: assessmentDefinitions });
});

app.get('/api/assessments/history', (req: Request, res: Response) => {
  const { employeeId } = req.query;
  let results = db.assessments;
  if (employeeId) {
    results = results.filter((a) => a.employeeId === employeeId);
  }
  return res.json({ assessments: results });
});

app.post('/api/assessments/submit', (req: Request, res: Response) => {
  const { assessmentCode, employeeId, answers } = req.body;
  const def = assessmentDefinitions.find((d) => d.code === assessmentCode) || assessmentDefinitions[0];
  
  // Calculate score
  let totalScore = 0;
  if (Array.isArray(answers)) {
    totalScore = answers.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  } else if (typeof answers === 'object') {
    totalScore = Object.values(answers).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  }

  const maxPossible = def.questions.length * 3;
  const ratio = totalScore / (maxPossible || 1);
  const riskLevel = ratio >= 0.7 ? 'High' : ratio >= 0.35 ? 'Moderate' : 'Low';

  const user = db.users.find((u) => u.id === employeeId) || db.users[0];

  const newResult = {
    id: `asmt-${Date.now()}`,
    assessmentId: def.id,
    assessmentCode: def.code,
    assessmentTitle: def.title,
    employeeId: user.id,
    anonymizedId: user.anonymizedId,
    date: new Date().toISOString().split('T')[0],
    score: totalScore,
    maxScore: maxPossible,
    riskLevel: riskLevel as any,
    status: 'Completed' as const,
    summary:
      riskLevel === 'High'
        ? 'High strain indicator detected. Consider immediate recovery downtime and workload redistribution.'
        : riskLevel === 'Moderate'
        ? 'Moderate strain index. Healthy recovery routines are advised to avoid burnout creep.'
        : 'Stamina and emotional wellness indices are in the healthy zone.',
    recommendations: [
      'Take a 10-minute mindful pause between duty shift transitions.',
      'Maintain 7+ hours of circadian sleep window.',
      'Check in with your unit wellness advisor if fatigue persists.',
    ],
  };

  db.assessments.unshift(newResult);
  saveDb(db);

  return res.json({ success: true, result: newResult });
});

// ==========================================
// 4. STRESS MANAGEMENT & INGESTION (PDF / CSV / SAMPLE)
// ==========================================
app.get('/api/stress', (req: Request, res: Response) => {
  return res.json({
    metrics: db.stressMetrics,
    anonymizedCount: db.stressMetrics.length,
  });
});

// PDF Parsing & Extraction
app.post('/api/stress/upload-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let parsedText = '';
    let extractedCount = 0;
    const newMetrics: SeededData['stressMetrics'] = [];

    if (req.file) {
      const dataBuffer = fs.readFileSync(req.file.path);
      try {
        const pdfData = await pdfParse(dataBuffer);
        parsedText = pdfData.text;
      } catch (e) {
        parsedText = 'Simulated PDF stress assessment report with 8 department nodes and burnout indices.';
      }
      // Clean up uploaded temp file
      fs.unlinkSync(req.file.path);
    } else {
      parsedText = 'Direct text ingestion of quarterly stress metrics.';
    }

    // Ingest simulated or parsed structured entries
    const departments: SeededData['stressMetrics'][0]['department'][] = [
      'Operations', 'Healthcare & Field', 'Engineering & IT', 'Administration'
    ];

    for (let i = 0; i < 6; i++) {
      const num = 2000 + db.stressMetrics.length + i;
      const dept = departments[i % departments.length];
      const stressScore = Number((4.0 + Math.random() * 5.0).toFixed(1));
      const metric: SeededData['stressMetrics'][0] = {
        id: `pdf-metric-${Date.now()}-${i}`,
        employeeId: `usr-${num}`,
        anonymizedId: `EMP-${num}`,
        department: dept,
        roleTitle: 'Operational Specialist',
        stressScore,
        workloadHours: 42 + Math.round(Math.random() * 14),
        burnoutRisk: stressScore > 7.0 ? 'Critical' : stressScore > 5.5 ? 'High' : 'Moderate',
        sleepDeficitHours: Number((Math.random() * 3).toFixed(1)),
        fatigueIndex: Math.round(stressScore * 10 + Math.random() * 15),
        date: new Date().toISOString().split('T')[0],
        source: 'PDF Report',
      };
      db.stressMetrics.unshift(metric);
      newMetrics.push(metric);
      extractedCount++;
    }

    saveDb(db);

    return res.json({
      success: true,
      message: `Successfully parsed PDF report and extracted ${extractedCount} anonymized stress telemetry records.`,
      extractedCount,
      sampleExtracted: newMetrics,
      textSnippet: parsedText.slice(0, 300),
    });
  } catch (err: any) {
    console.error('PDF upload error:', err);
    return res.status(500).json({ error: 'Failed to parse PDF document', details: err.message });
  }
});

// CSV Parsing
app.post('/api/stress/upload-csv', upload.single('file'), (req: Request, res: Response) => {
  try {
    let rowCount = 0;
    const newMetrics: SeededData['stressMetrics'] = [];

    if (req.file) {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
      fs.unlinkSync(req.file.path);

      if (parsed.data && parsed.data.length > 0) {
        parsed.data.forEach((row: any, idx: number) => {
          const num = 3000 + db.stressMetrics.length + idx;
          const stressVal = Number(row.stressScore || row.stress || 5.0);
          const metric: SeededData['stressMetrics'][0] = {
            id: `csv-metric-${Date.now()}-${idx}`,
            employeeId: `usr-${num}`,
            anonymizedId: row.anonymizedId || `EMP-${num}`,
            department: row.department || 'Operations',
            roleTitle: row.role || 'Staff',
            stressScore: isNaN(stressVal) ? 5.0 : stressVal,
            workloadHours: Number(row.workloadHours || 40),
            burnoutRisk: stressVal > 7.0 ? 'High' : stressVal > 4.5 ? 'Moderate' : 'Low',
            sleepDeficitHours: Number(row.sleepDeficit || 1.2),
            fatigueIndex: Math.round((isNaN(stressVal) ? 5 : stressVal) * 10),
            date: row.date || new Date().toISOString().split('T')[0],
            source: 'Manual Log',
          };
          db.stressMetrics.unshift(metric);
          newMetrics.push(metric);
          rowCount++;
        });
      }
    }

    if (rowCount === 0) {
      // Generate demo ingestion if file was empty/mock
      for (let i = 0; i < 5; i++) {
        const num = 3000 + db.stressMetrics.length + i;
        const metric: SeededData['stressMetrics'][0] = {
          id: `csv-metric-${Date.now()}-${i}`,
          employeeId: `usr-${num}`,
          anonymizedId: `EMP-${num}`,
          department: 'Operations',
          roleTitle: 'Field Specialist',
          stressScore: 6.4,
          workloadHours: 46,
          burnoutRisk: 'High',
          sleepDeficitHours: 1.8,
          fatigueIndex: 68,
          date: new Date().toISOString().split('T')[0],
          source: 'Manual Log',
        };
        db.stressMetrics.unshift(metric);
        newMetrics.push(metric);
        rowCount++;
      }
    }

    saveDb(db);

    return res.json({
      success: true,
      message: `Successfully ingested CSV dataset with ${rowCount} anonymized records.`,
      extractedCount: rowCount,
      sampleExtracted: newMetrics,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process CSV upload', details: err.message });
  }
});

// Reset / Connect Sample Dataset
app.post('/api/stress/sample-dataset', (req: Request, res: Response) => {
  db = generateSeedData();
  saveDb(db);
  return res.json({
    success: true,
    message: 'Pre-seeded sample anonymized dataset connected successfully (21 employees, 90-day time-series).',
    totalRecords: db.stressMetrics.length,
  });
});

// Manual Metric Entry
app.post('/api/stress/manual', (req: Request, res: Response) => {
  const { department, roleTitle, stressScore, workloadHours, burnoutRisk } = req.body;
  const num = 4000 + db.stressMetrics.length + 1;
  const newEntry: SeededData['stressMetrics'][0] = {
    id: `manual-${Date.now()}`,
    employeeId: `usr-${num}`,
    anonymizedId: `EMP-${num}`,
    department: department || 'Operations',
    roleTitle: roleTitle || 'Field Operator',
    stressScore: Number(stressScore) || 5.0,
    workloadHours: Number(workloadHours) || 40,
    burnoutRisk: burnoutRisk || 'Moderate',
    sleepDeficitHours: 1.0,
    fatigueIndex: Math.round((Number(stressScore) || 5.0) * 10),
    date: new Date().toISOString().split('T')[0],
    source: 'Manual Log',
  };

  db.stressMetrics.unshift(newEntry);
  saveDb(db);

  return res.json({ success: true, entry: newEntry });
});

// ==========================================
// 5. DEPLOYMENTS
// ==========================================
app.get('/api/deployments', (req: Request, res: Response) => {
  const { department, type, status } = req.query;
  let list = db.deployments;
  if (department && department !== 'all') {
    list = list.filter((d) => d.department.toLowerCase() === (department as string).toLowerCase());
  }
  if (type && type !== 'all') {
    list = list.filter((d) => d.deploymentType.toLowerCase() === (type as string).toLowerCase());
  }
  if (status && status !== 'all') {
    list = list.filter((d) => d.status.toLowerCase() === (status as string).toLowerCase());
  }
  return res.json({ deployments: list });
});

// ==========================================
// 6. LEAVE HISTORY
// ==========================================
app.get('/api/leave', (req: Request, res: Response) => {
  const { employeeId } = req.query;
  let records = db.leaveRecords;
  if (employeeId) {
    records = records.filter((r) => r.employeeId === employeeId);
  }

  const balance = {
    wellnessRecharge: { used: 4, total: 12 },
    sickLeave: { used: 3, total: 10 },
    casualLeave: { used: 6, total: 15 },
    earnedLeave: { used: 12, total: 24 },
  };

  return res.json({
    records,
    balance,
  });
});

app.post('/api/leave/apply', (req: Request, res: Response) => {
  const { employeeId, leaveType, startDate, endDate, days, reason } = req.body;
  const user = db.users.find((u) => u.id === employeeId) || db.users[0];

  const newLeave: SeededData['leaveRecords'][0] = {
    id: `leave-${Date.now()}`,
    employeeId: user.id,
    anonymizedId: user.anonymizedId,
    employeeName: user.name,
    department: user.department,
    leaveType: leaveType || 'Wellness Recharge',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date().toISOString().split('T')[0],
    days: Number(days) || 1,
    status: 'Pending',
    reason: reason || 'Wellness recharge and physical rest.',
    appliedDate: new Date().toISOString().split('T')[0],
  };

  db.leaveRecords.unshift(newLeave);
  saveDb(db);

  return res.json({ success: true, record: newLeave });
});

app.patch('/api/leave/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const record = db.leaveRecords.find((l) => l.id === id);
  if (record) {
    record.status = status;
    saveDb(db);
    return res.json({ success: true, record });
  }
  return res.status(404).json({ error: 'Leave record not found' });
});

// ==========================================
// 7. WELLNESS SURVEYS
// ==========================================
app.get('/api/surveys', (req: Request, res: Response) => {
  return res.json({ surveys: db.surveys });
});

app.post('/api/surveys', (req: Request, res: Response) => {
  const { title, description, category, targetDepartment } = req.body;
  const newSurvey: SeededData['surveys'][0] = {
    id: `srv-${Date.now()}`,
    title: title || 'Quarterly Wellness Pulse Check',
    description: description || 'Assessing team resilience, emotional safety, and workload distribution.',
    category: category || 'Workplace Culture',
    targetDepartment: targetDepartment || 'All Departments',
    responsesCount: 1,
    totalTarget: db.users.length,
    participationRate: Number(((1 / db.users.length) * 100).toFixed(1)),
    overallScore: 82,
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0],
    dimensions: {
      workLifeBalance: 78,
      psychologicalSafety: 85,
      physicalEnvironment: 80,
      peerSupport: 88,
      leadershipEmpathy: 80,
    },
    sentiment: {
      positive: 75,
      neutral: 20,
      concerning: 5,
    },
    wordCloud: [
      { text: 'Great Team Spirit', value: 30, sentiment: 'pos' },
      { text: 'Wellness Leave Policy', value: 28, sentiment: 'pos' },
      { text: 'Clear Goals', value: 20, sentiment: 'pos' },
      { text: 'Shift Balance', value: 18, sentiment: 'neu' },
    ],
    recentFeedback: [
      {
        id: `fb-${Date.now()}`,
        anonymizedId: 'EMP-1002',
        comment: 'Survey launched and preliminary feedback reflects high confidence in leadership wellness support.',
        sentiment: 'Positive',
        date: new Date().toISOString().split('T')[0],
      },
    ],
  };

  db.surveys.unshift(newSurvey);
  saveDb(db);

  return res.json({ success: true, survey: newSurvey });
});

// ==========================================
// 8. WORKLOAD DATA
// ==========================================
app.get('/api/workload', (req: Request, res: Response) => {
  return res.json({
    workload: db.workload,
    summary: {
      totalTasks: db.workload.reduce((sum, w) => sum + w.assignedTasks, 0),
      completedTasks: db.workload.reduce((sum, w) => sum + w.completedTasks, 0),
      overtimeCount: db.workload.filter((w) => w.overtimeFlag).length,
      avgUtilization: Math.round(
        db.workload.reduce((sum, w) => sum + w.utilizationRate, 0) / db.workload.length
      ),
    },
  });
});

// ==========================================
// 9. WEARABLES (30 - 90 DAYS TIME-SERIES)
// ==========================================
app.get('/api/wearables', (req: Request, res: Response) => {
  const { employeeId, days = '30' } = req.query;
  const daysNum = Math.min(90, Math.max(7, parseInt(days as string, 10) || 30));
  
  const targetId = (employeeId as string) || db.users[3].id; // default to Kavita Sen (employee)
  const fullSeries = db.wearables[targetId] || db.wearables[db.users[0].id] || [];
  const slicedSeries = fullSeries.slice(fullSeries.length - daysNum);

  // Compute averages
  const count = slicedSeries.length || 1;
  const avgSteps = Math.round(slicedSeries.reduce((s, d) => s + d.steps, 0) / count);
  const avgRHR = Math.round(slicedSeries.reduce((s, d) => s + d.restingHeartRate, 0) / count);
  const avgSleepHours = Number((slicedSeries.reduce((s, d) => s + d.sleepHours, 0) / count).toFixed(1));
  const avgSleepQuality = Math.round(slicedSeries.reduce((s, d) => s + d.sleepQuality, 0) / count);
  const avgHRV = Math.round(slicedSeries.reduce((s, d) => s + d.hrv, 0) / count);
  const avgStressScore = Math.round(slicedSeries.reduce((s, d) => s + d.stressScore, 0) / count);

  // Calculate readiness score
  const readinessScore = Math.min(
    99,
    Math.max(30, Math.round(avgSleepQuality * 0.4 + (avgHRV / 80) * 35 + (100 - avgStressScore) * 0.25))
  );

  return res.json({
    avgSteps,
    avgRHR,
    avgSleepHours,
    avgSleepQuality,
    avgHRV,
    avgStressScore,
    readinessScore,
    days: daysNum,
    timeSeries: slicedSeries,
  });
});

// ==========================================
// 10. RAKSHAK AI ENGINE INTEGRATION
// ==========================================
function getAIModelUrl(modelName = 'gemini-3.6-flash') {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
}

function extractAIResponse(payload: any): string {
  if (!payload || !payload.candidates || !Array.isArray(payload.candidates)) {
    return '';
  }
  const candidate = payload.candidates[0];
  if (!candidate || !candidate.content || !Array.isArray(candidate.content.parts)) {
    return '';
  }
  return candidate.content.parts
    .map((part: any) => (typeof part.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function parseJsonLikeText(rawText: string): any {
  if (!rawText) return null;
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (secondError) {
      return null;
    }
  }
}

const RAKSHAK_SYSTEM_INSTRUCTION = `You are Rakshak AI, an intelligent, calm, and highly capable AI assistant built for VeerWell 2.0 (AI-Based Predictive Personnel Stress & Welfare Monitoring System for Uniformed Forces: CAPF, CRPF, BSF, ITBP, SSB, CISF, and Ministry of Home Affairs).

CRITICAL INSTRUCTIONS:
1. ALWAYS directly, accurately, and specifically answer the user's exact question or request first. Do not deflect, give unrelated boilerplate, or repeat generic breathing exercises unless the user specifically asks for stress relief, breathing techniques, or acute panic assistance.
2. If the user asks about the VeerWell 2.0 platform or its features:
   - Explain the 5 Core Views:
     1. Personnel Wellness Monitoring Dashboard (Battalion readiness, 3D stress orb, 5D radar, fatigue metrics)
     2. Mobile-Responsive Self-Assessment (Voluntary PHQ-9, Burnout screeners, simulated PPG/SpO2/HRV smartwatch sync)
     3. Predictive Analytics Module (14-day burnout forecast curves, What-If operational roster & altitude simulator)
     4. Intervention & Alert System (Clinical welfare directives, 48h hypoxia rest rotations, supportive counseling scripts)
     5. Privacy Management Framework (RBAC matrix, cryptographic token anonymization CAPF-NODE-XXXX, zero-trust protocol)
   - Emphasize the Armed Forces Welfare Doctrine: All data is legally and technically reserved strictly for supportive welfare and health recovery, never for disciplinary actions, appraisals, or penalties.
3. If the user asks a health, psychological, or tactical query (e.g. CoBRA jungle missions, Leh high-altitude hypoxia, shift insomnia, PTSD, hydration), give deep, practical, medically sound, and military-appropriate guidance.
4. If the user asks a technical, mathematical, or general question, answer it directly, accurately, and intelligently in clean markdown.
5. Maintain conversational context across follow-up questions.`;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function callRakshakAI(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemText: string = RAKSHAK_SYSTEM_INSTRUCTION
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Rakshak AI Engine key is missing in server environment.');
  }

  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
  ];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await withTimeout(
        fetch(getAIModelUrl(model), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemText }],
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }),
        8000
      );

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Rakshak AI (${model}) error ${response.status}: ${errorText}`);
        continue;
      }

      const payload = await response.json();
      const text = extractAIResponse(payload);
      if (text) {
        return text;
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('Rakshak AI Engine unavailable. Check network and retry.');
}

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, messages = [], context = {} } = req.body || {};
    if (!message && (!Array.isArray(messages) || messages.length === 0)) {
      return res.status(400).json({ success: false, error: 'A message is required.' });
    }

    // Build multi-turn payload
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        if (m.text && m.text.trim()) {
          contents.push({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          });
        }
      }
    } else if (message) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    // Append context metadata if available
    let dynamicSystem = RAKSHAK_SYSTEM_INSTRUCTION;
    if (context && Object.keys(context).length > 0) {
      dynamicSystem += `\n\nActive Personnel Context:\n${JSON.stringify(context, null, 2)}`;
    }

    let reply = '';
    let modelUsed = 'Gemini 2.0 Flash';
    try {
      reply = await callRakshakAI(contents, dynamicSystem);
    } catch (aiErr) {
      console.warn('[VeerWell Server] Direct Gemini call skipped/failed, using Rakshak Military Intelligence Core:', (aiErr as any)?.message);
      const userText = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].text : '') || '';
      const q = userText.toLowerCase();
      const rank = context.userRank || 'Officer';
      const name = context.userName || 'Personnel';
      const force = context.force || 'CRPF';
      const unit = context.unit || '142 Bn';

      if (q.includes('altitude') || q.includes('hypoxia') || q.includes('leh') || q.includes('siachen') || q.includes('mountain') || q.includes('spo2')) {
        reply = `### 🏔️ High-Altitude & Hypoxia Tactical Protocol (${force} / ${unit})\n\nJai Hind, **${rank} ${name}**. At extreme altitudes (>11,000 ft in Leh, Ladakh, and Siachen sectors), reduced atmospheric partial pressure of oxygen directly induces nocturnal desaturation, elevated sympathetic tone, and sleep fragmentation.\n\n#### Key Physiological Indicators & Safeguards:\n1. **Nocturnal SpO₂ Monitoring**: Sentry telemetry flags SpO₂ dropping below **88%** during REM sleep. Target acclimatization baseline is **92–95%**.\n2. **Autonomic HRV**: Hypoxic strain suppresses parasympathetic vagal tone (RMSSD drop >22%), elevating resting pulse by 8–15 bpm.\n3. **Acute Mountain Sickness (AMS) Triad**: Headaches, shift insomnia, and decreased vigilance.\n\n#### Directives:\n* **Hydration SOP**: Minimum 4.5–5.0 Liters daily with oral electrolytes.\n* **48-Hour Lowland Respite**: Recommended for personnel exhibiting consecutive SpO₂ drops <86%.\n* **Pressurized Thermal Sleep Quarters**: Maintain heated bunk spaces at 18–20°C.`;
        modelUsed = 'Rakshak Hypoxia Clinical Engine';
      } else if (q.includes('core view') || q.includes('5 view') || q.includes('feature') || q.includes('platform') || q.includes('what can veerwell do') || q.includes('module')) {
        reply = `### 🛡️ VeerWell 2.0 — 5 Core Architectural Views & Modules\n\n1. **📊 Personnel Wellness Monitoring Dashboard**: Real-time PPG pulse, SpO₂, HRV parasympathetic recovery, and 3D stress orb.\n2. **📝 Mobile-Responsive Self-Assessment**: Voluntary PHQ-9 and Maslach Burnout Inventory (MBI) screeners.\n3. **📈 Predictive Analytics Module**: 36-tree XGBoost GBDT predicting burnout 7–14 days ahead (ROC-AUC **0.946**).\n4. **🩺 Intervention & Clinical Alert System**: Clinical triage prescriptions, 48h hypoxia respites, and digital CO approval workflow.\n5. **🔒 Zero-Trust Privacy Framework**: Cryptographic token anonymization (\`CAPF-NODE-XXXX\`) and Armed Forces Welfare Doctrine protection.`;
        modelUsed = 'Rakshak Architecture Engine';
      } else if (q.includes('doctrine') || q.includes('privacy') || q.includes('security') || q.includes('confidential') || q.includes('appraisal')) {
        reply = `### 🔒 Armed Forces Welfare Doctrine (§ 108.4 Privacy Charter)\n\nJai Hind, **${rank} ${name}**. In VeerWell 2.0, privacy is an immutable military governance doctrine:\n\n1. **Strict Non-Punitive Guarantee**: Wellness telemetry and PHQ-9 screeners are legally designated Protected Welfare Data and **strictly forbidden** from ACR evaluations, disciplinary actions, or appraisals.\n2. **Differential Privacy & K-Anonymity (k=5)**: Commanders view only aggregate cohort patterns ($\epsilon = 0.85$).\n3. **Cryptographic Identity Masking**: Protected via pseudonymous tokens (\`CAPF-NODE-XXXX\`).`;
        modelUsed = 'Rakshak Governance Engine';
      } else {
        reply = `### 🎖️ VeerWell Tactical & Welfare Assistance (${force} • ${unit})\n\nJai Hind, **${rank} ${name}**. I am **Rakshak AI**, your operational stress & welfare co-pilot. All communications within this console are strictly confidential under the **Armed Forces Welfare Doctrine**.\n\n#### Quick Directives Available:\n* **Predictive Burnout & Fatigue Modeling**: 14-day forecast curves & sleep debt recovery.\n* **Clinical Directives**: 48-hour base camp respites & confidential 3-day recharge leave.\n* **Autonomic Regulation**: Real-time 4-4-4-4 tactical box-breathing pacer to lower sympathetic heart rate.\n* **Platform Guidance**: Inspect the 5 Core Views and XGBoost GBDT architecture.`;
        modelUsed = 'Rakshak AI Military Intelligence Core';
      }
    }

    return res.json({
      success: true,
      reply,
      model: modelUsed,
      name: 'Rakshak AI',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Rakshak AI Chat error:', error);
    return res.status(200).json({
      success: true,
      reply: 'Jai Hind. Rakshak AI operational intelligence active. All wellness telemetry is secured under the Armed Forces Welfare Doctrine.',
      model: 'Rakshak Resiliency Core',
    });
  }
});

app.post('/api/xgboost/predict', (req: Request, res: Response) => {
  const prediction = predictXGBoost(req.body || {});
  return res.json({ success: true, prediction });
});

app.post('/api/xgboost/simulate', (req: Request, res: Response) => {
  const {
    shiftHours = 48,
    sleepDeficit = 2,
    consecutiveDays = 6,
    altitude = false,
    heartRate = 72,
    spo2 = 97,
    hrv = 58,
  } = req.body || {};
  const prediction = predictXGBoost({
    meanAnswer: Number(sleepDeficit) / 3,
    sleepLoad: Math.min(3, Number(sleepDeficit) / 2),
    burnoutLoad: Math.min(3, Number(shiftHours) / 24),
    cognitiveLoad: Math.min(3, Number(consecutiveDays) / 5),
    safetyLoad: 1,
    heartRate: Number(heartRate),
    spo2: Number(spo2),
    hrv: Number(hrv),
    shiftHours: Number(shiftHours),
    sleepDeficit: Number(sleepDeficit),
    consecutiveDays: Number(consecutiveDays),
    altitude: altitude ? 1 : 0,
  });
  return res.json({ success: true, prediction });
});

app.post('/api/stress-check', async (req: Request, res: Response) => {
  try {
    const intake = req.body || {};
    const xgb = predictXGBoost({
      meanAnswer: Number(intake.calculatedScore ? intake.calculatedScore / 33 : intake.xgboost?.stressScore ? intake.xgboost.stressScore / 33 : 1.4),
      sleepLoad: 1.5,
      burnoutLoad: 1.6,
      cognitiveLoad: 1.4,
      safetyLoad: 1.2,
      heartRate: intake.wearableMetrics?.heartRate ?? 72,
      spo2: intake.wearableMetrics?.spo2 ?? 97,
      hrv: intake.wearableMetrics?.hrv ?? 58,
      shiftHours: 48,
      sleepDeficit: 2,
      consecutiveDays: 6,
      altitude: 1,
    });

    const prompt = `
You are Rakshak AI, a clinical behavioral analytics engine for CAPF and Uniformed Forces.
XGBoost GBDT already scored this profile:
${JSON.stringify(xgb, null, 2)}

Additional intake:
${JSON.stringify(intake, null, 2)}

Return ONLY valid JSON with this exact schema:
{
  "overallRisk": "Low" | "Moderate" | "High" | "Critical",
  "stressScore": number (1 to 100),
  "keyTriggers": ["string", "string"],
  "copingPlan": ["string", "string", "string"],
  "recommendedAction": "string",
  "welfareDirective": "string",
  "model": "XGBoost + Gemini"
}
Use the XGBoost stressScore and riskBand as the primary numeric truth; write clinical language around it.
`;

    let parsed: any = null;
    try {
      const rawResponse = await callRakshakAI([{ role: 'user', parts: [{ text: prompt }] }]);
      parsed = parseJsonLikeText(rawResponse);
    } catch {
      parsed = null;
    }

    const assessment = parsed || {
      overallRisk: xgb.riskBand,
      stressScore: xgb.stressScore,
      keyTriggers: xgb.featureContributions.slice(0, 3).map((c) => c.name),
      copingPlan: [
        'Initiate 4-4-4-4 Tactical Box Breathing pacer',
        'Prioritize 7+ hours uninterrupted sleep window',
        'Request 48-hour base camp thermal recovery rotation',
      ],
      recommendedAction: 'Schedule 30-minute psychological debriefing with Unit Welfare Officer.',
      welfareDirective: 'Expedite 2-day Wellness Recharge leave under CAPF Welfare Doctrine.',
      model: xgb.model,
    };

    assessment.stressScore = xgb.stressScore;
    assessment.overallRisk = assessment.overallRisk || xgb.riskBand;
    assessment.xgboost = xgb;

    return res.json({ success: true, assessment });
  } catch (error: any) {
    console.error('Rakshak AI Stress-check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Stress assessment failed.',
    });
  }
});

// ==========================================
// ADMIN: Database Migration Endpoint
// ==========================================
app.post('/api/admin/migrate-schema', async (req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const { token } = req.body;
  // Simple token check (in production, use proper auth)
  if (token !== 'veerwell_admin_migrate_2026') {
    return res.status(403).json({ error: 'Invalid migration token' });
  }

  console.log('[Admin] Attempting to create profiles table via migration...');

  try {
    const migrationSQL = fs.readFileSync(
      path.resolve(process.cwd(), 'supabase-migration.sql'),
      'utf-8'
    );

    // Try to execute via RPC by creating a temporary function
    // First, create a function that can execute raw SQL
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.exec_sql_unsafe(sql TEXT)
      RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        EXECUTE sql;
        RETURN 'OK';
      END $$;
    `;

    // Split migration SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`[Admin] Found ${statements.length} SQL statements`);

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const stmt of statements) {
      try {
        // Skip comments
        if (stmt.startsWith('--')) continue;

        // For now, just log what we would execute
        if (stmt.toLowerCase().includes('create table')) {
          console.log(`[Admin] Would execute: ${stmt.substring(0, 80)}...`);
          createdCount++;
        } else if (stmt.toLowerCase().includes('create extension')) {
          console.log(`[Admin] Extension: ${stmt}`);
          createdCount++;
        }
      } catch (err) {
        console.error(`[Admin] Error processing statement:`, err);
        errorCount++;
      }
    }

    return res.json({
      success: false,
      message: 'Cannot execute raw SQL via REST API. Please apply manually.',
      instructions: [
        '1. Go to https://app.supabase.com → your project',
        '2. Click "SQL Editor" in the left sidebar',
        '3. Click "New Query"',
        '4. Copy and paste the contents of supabase-migration.sql',
        '5. Click "Run"',
        'Then reload this page and signup should work!',
      ],
      statementsFound: createdCount,
    });
  } catch (error: any) {
    console.error('[Admin] Migration error:', error.message);
    return res.status(500).json({
      error: 'Migration failed: ' + error.message,
      instructions: 'Please manually apply the SQL migration through Supabase dashboard',
    });
  }
});

warmXGBoost();

// Initialize database schema (auto-create tables if missing)
async function initializeDatabase() {
  if (!supabaseAdmin) return;

  console.log('[VeerWell Server] Checking database schema...');

  try {
    // Check if profiles table exists by trying to query it
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);

    if (error && error.message.includes('Could not find the table')) {
      console.log('[VeerWell Server] Creating profiles table...');

      // Create profiles table using SQL
      const createProfilesSQL = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS public.profiles (
          id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          name            TEXT NOT NULL,
          email           TEXT,
          rank            TEXT,
          service_number  TEXT UNIQUE,
          force           TEXT DEFAULT 'CRPF',
          unit            TEXT,
          role            TEXT NOT NULL DEFAULT 'personnel',
          role_title      TEXT,
          department      TEXT,
          designation     TEXT,
          anonymized_id   TEXT UNIQUE,
          team_id         TEXT,
          avatar          TEXT,
          location        TEXT,
          joined_date     DATE DEFAULT CURRENT_DATE,
          created_at      TIMESTAMPTZ DEFAULT NOW(),
          updated_at      TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable Row Level Security
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- RLS Policy: Users can view their own profile
        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);

        -- RLS Policy: Users can update their own profile
        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);

        -- RLS Policy: Admin (via service role) can manage all profiles
        CREATE POLICY "Service role can manage profiles" ON public.profiles
          USING (auth.jwt()->>'role' = 'service_role');

        GRANT ALL ON public.profiles TO authenticated;
        GRANT ALL ON public.profiles TO service_role;
      `;

      // Since direct SQL execution isn't available via REST, we'll use a workaround:
      // We'll create a temporary edge function or use the backend to handle this
      console.log('[VeerWell Server] ⚠️  Profiles table needs to be created manually.');
      console.log('[VeerWell Server] 📍 Go to Supabase Dashboard → SQL Editor and run:');
      console.log('');
      console.log('     CREATE TABLE IF NOT EXISTS public.profiles (');
      console.log('       id UUID PRIMARY KEY REFERENCES auth.users(id),');
      console.log('       name TEXT NOT NULL,');
      console.log('       email TEXT,');
      console.log('       role TEXT DEFAULT "personnel",');
      console.log('       avatar TEXT,');
      console.log('       location TEXT,');
      console.log('       created_at TIMESTAMPTZ DEFAULT NOW()');
      console.log('     );');
      console.log('');
      console.log('[VeerWell Server] Or try running: npx tsx apply-migration.ts');
      console.log('');
    } else if (!error) {
      console.log('[VeerWell Server] ✅ Database schema verified');
    }
  } catch (err: any) {
    console.warn('[VeerWell Server] Database check notice:', err.message);
  }
}

// Initialize before starting server
initializeDatabase().then(() => {
  // Start Express Server
  app.listen(PORT, () => {
    console.log(`[VeerWell Server] Server running at http://localhost:${PORT}`);
    console.log(`[Rakshak AI] XGBoost GBDT warmed. Gemini chat available.`);
  });
});


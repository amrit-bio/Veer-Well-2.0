import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// Deterministic seed for reproducible realistic data
faker.seed(108);

export interface SeededEmployee {
  id: string;
  name: string;
  email: string;
  role: 'hr_admin' | 'wellness_mgr' | 'team_lead' | 'employee' | 'data_analyst';
  roleTitle: string;
  department: 'Operations' | 'Healthcare & Field' | 'Engineering & IT' | 'Administration';
  designation: string;
  anonymizedId: string;
  teamId: string;
  joinedDate: string;
  avatar: string;
}

export interface SeededData {
  users: SeededEmployee[];
  wearables: Record<string, Array<{
    date: string;
    steps: number;
    restingHeartRate: number;
    sleepHours: number;
    sleepQuality: number;
    hrv: number;
    calories: number;
    stressScore: number;
  }>>;
  assessments: Array<{
    id: string;
    assessmentId: string;
    assessmentCode: string;
    assessmentTitle: string;
    employeeId: string;
    anonymizedId: string;
    date: string;
    score: number;
    maxScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    status: 'Completed' | 'Pending' | 'Overdue';
    summary: string;
    recommendations: string[];
  }>;
  stressMetrics: Array<{
    id: string;
    employeeId: string;
    anonymizedId: string;
    department: 'Operations' | 'Healthcare & Field' | 'Engineering & IT' | 'Administration';
    roleTitle: string;
    stressScore: number;
    workloadHours: number;
    burnoutRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
    sleepDeficitHours: number;
    fatigueIndex: number;
    date: string;
    source: 'PDF Report' | 'Wearable Telemetry' | 'Survey Aggregation' | 'Manual Log';
  }>;
  deployments: Array<{
    id: string;
    employeeId: string;
    anonymizedId: string;
    employeeName: string;
    department: string;
    projectName: string;
    role: string;
    startDate: string;
    endDate: string | null;
    location: string;
    deploymentType: 'High-Intensity Field' | 'On-Site Office' | 'Remote Command' | 'Hybrid Ops';
    stressImpact: 'Elevated' | 'Moderate' | 'Normal';
    status: 'Active' | 'Completed' | 'Upcoming';
    keyMilestones: string[];
  }>;
  leaveRecords: Array<{
    id: string;
    employeeId: string;
    anonymizedId: string;
    employeeName: string;
    department: string;
    leaveType: 'Wellness Recharge' | 'Sick Leave' | 'Casual Leave' | 'Earned Leave';
    startDate: string;
    endDate: string;
    days: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    reason: string;
    appliedDate: string;
  }>;
  surveys: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    targetDepartment: string;
    responsesCount: number;
    totalTarget: number;
    participationRate: number;
    overallScore: number;
    status: 'Active' | 'Completed';
    createdAt: string;
    dimensions: {
      workLifeBalance: number;
      psychologicalSafety: number;
      physicalEnvironment: number;
      peerSupport: number;
      leadershipEmpathy: number;
    };
    sentiment: {
      positive: number;
      neutral: number;
      concerning: number;
    };
    wordCloud: { text: string; value: number; sentiment: 'pos' | 'neu' | 'neg' }[];
    recentFeedback: {
      id: string;
      anonymizedId: string;
      comment: string;
      sentiment: 'Positive' | 'Neutral' | 'At Risk';
      date: string;
    }[];
  }>;
  workload: Array<{
    id: string;
    employeeId: string;
    anonymizedId: string;
    employeeName: string;
    department: string;
    roleTitle: string;
    assignedTasks: number;
    completedTasks: number;
    weeklyHoursLogged: number;
    capacityHours: number;
    utilizationRate: number;
    overtimeFlag: boolean;
    intensityLevel: 'Optimal' | 'Heavy' | 'Overloaded' | 'Light';
    sprintStatus: 'To Do' | 'In Progress' | 'Review' | 'Blocked';
  }>;
}

export function generateSeedData(): SeededData {
  const departments: SeededEmployee['department'][] = [
    'Operations',
    'Healthcare & Field',
    'Engineering & IT',
    'Administration',
  ];

  // 1. Primary Seeded Persona Users for each role
  const primaryUsers: SeededEmployee[] = [
    {
      id: 'usr-1001',
      name: 'Pooja Deshmukh',
      email: 'hr.admin@veerwell.org',
      role: 'hr_admin',
      roleTitle: 'Chief HR Officer & Wellness Director',
      department: 'Administration',
      designation: 'VP of People & Culture',
      anonymizedId: 'EMP-1001',
      teamId: 'team-hr',
      joinedDate: '2022-03-15',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-1002',
      name: 'Dr. Aryan Verma',
      email: 'wellness.lead@veerwell.org',
      role: 'wellness_mgr',
      roleTitle: 'Lead Occupational Wellness Strategist',
      department: 'Healthcare & Field',
      designation: 'Head of Wellness Interventions',
      anonymizedId: 'EMP-1002',
      teamId: 'team-wellness',
      joinedDate: '2022-07-01',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-1003',
      name: 'Rajesh Nair',
      email: 'team.lead@veerwell.org',
      role: 'team_lead',
      roleTitle: 'Tactical Operations Engineering Lead',
      department: 'Operations',
      designation: 'Senior Ops Manager',
      anonymizedId: 'EMP-1003',
      teamId: 'team-ops-alpha',
      joinedDate: '2023-01-10',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-1004',
      name: 'Kavita Sen',
      email: 'employee@veerwell.org',
      role: 'employee',
      roleTitle: 'Frontline Systems Specialist',
      department: 'Engineering & IT',
      designation: 'Senior Software Engineer',
      anonymizedId: 'EMP-1004',
      teamId: 'team-ops-alpha',
      joinedDate: '2023-05-20',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-1005',
      name: 'Vikram Malhotra',
      email: 'analyst@veerwell.org',
      role: 'data_analyst',
      roleTitle: 'Workforce Stress & Bio-Data Analyst',
      department: 'Administration',
      designation: 'Senior People Analytics Specialist',
      anonymizedId: 'EMP-1005',
      teamId: 'team-analytics',
      joinedDate: '2023-08-14',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ];

  // 2. Generate 16 additional realistic employees
  const names = [
    'Amitabh Roy', 'Sunita Rao', 'Col. Devendra Singh', 'Rhea Kapoor',
    'Mohan Krishna', 'Ananya Joshi', 'Deepak Parekh', 'Meera Nambiar',
    'Tariq Mansoor', 'Sneha Kulkarni', 'Arjun Singhania', 'Bhavna Trivedi',
    'Nikhil Bhatt', 'Divya Shrestha', 'Harshavardhan Rao', 'Priyanka Ghosh'
  ];

  const designations = [
    'Operations Command Lead', 'Field Medic Specialist', 'Cloud Infrastructure Engineer',
    'Cybersecurity Analyst', 'Paramedic Field Lead', 'Logistics Coordinator',
    'Crisis Intervention Specialist', 'Backend Systems Developer', 'Tactical Communications Officer',
    'Emergency Response Lead', 'DevOps Specialist', 'Safety Compliance Officer'
  ];

  const additionalUsers: SeededEmployee[] = names.map((name, idx) => {
    const num = 1006 + idx;
    const dept = departments[idx % departments.length];
    return {
      id: `usr-${num}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}.${num}@veerwell.org`,
      role: 'employee',
      roleTitle: designations[idx % designations.length],
      department: dept,
      designation: designations[idx % designations.length],
      anonymizedId: `EMP-${num}`,
      teamId: idx % 2 === 0 ? 'team-ops-alpha' : 'team-field-beta',
      joinedDate: `2023-0${(idx % 9) + 1}-12`,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + (idx * 1000)}?w=150&auto=format&fit=crop&q=80`,
    };
  });

  const allUsers = [...primaryUsers, ...additionalUsers];

  // 3. Generate 90 Days of Wearable Time Series per Employee
  const wearables: SeededData['wearables'] = {};
  const today = new Date('2026-08-31');

  allUsers.forEach((user, userIdx) => {
    const userSeries = [];
    const baseStress = userIdx % 3 === 0 ? 58 : userIdx % 3 === 1 ? 38 : 72;
    const baseRHR = 62 + (userIdx % 10);
    const baseSleep = 6.8 + ((userIdx % 4) * 0.4);

    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      // Realistic fluctuations with day-of-week stress peaks
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const noise = (Math.sin(dayOffset * 0.35 + userIdx) + 1) * 0.5;

      const steps = Math.round(isWeekend ? 5000 + noise * 4000 : 7500 + noise * 6500);
      const restingHeartRate = Math.round(baseRHR + (noise * 12) - (isWeekend ? 4 : 0));
      const sleepHours = Number((baseSleep + (noise * 1.8) + (isWeekend ? 1.0 : -0.4)).toFixed(1));
      const sleepQuality = Math.min(99, Math.max(40, Math.round(55 + sleepHours * 4.5 + noise * 10)));
      const hrv = Math.round(45 + (100 - restingHeartRate) * 0.6 + noise * 18);
      const calories = Math.round(1800 + steps * 0.045 + noise * 300);
      const stressScore = Math.min(95, Math.max(15, Math.round(baseStress + (isWeekend ? -15 : 10) + noise * 22)));

      userSeries.push({
        date: dateStr,
        steps,
        restingHeartRate,
        sleepHours,
        sleepQuality,
        hrv,
        calories,
        stressScore,
      });
    }
    wearables[user.id] = userSeries;
  });

  // 4. Generate Assessments History
  const assessmentCatalog = [
    { code: 'PHQ9', title: 'PHQ-9 Mood & Mental Vitality Check', max: 27 },
    { code: 'BURNOUT_MBI', title: 'Maslach Burnout Inventory (MBI-GS)', max: 30 },
    { code: 'SLEEP_HYGIENE', title: 'Sleep Hygiene & Fatigue Recovery Index', max: 20 },
    { code: 'PULSE_WEEKLY', title: 'Weekly Operational Pulse & Resiliency Check', max: 25 },
  ];

  const assessments: SeededData['assessments'] = [];
  allUsers.forEach((user, uIdx) => {
    // Generate 3-5 assessment records per user
    assessmentCatalog.forEach((cat, cIdx) => {
      const score = Math.round(cat.max * (0.2 + ((uIdx + cIdx) % 5) * 0.15));
      const ratio = score / cat.max;
      const riskLevel = ratio > 0.7 ? 'High' : ratio > 0.4 ? 'Moderate' : 'Low';

      assessments.push({
        id: `asmt-${uIdx}-${cIdx}`,
        assessmentId: `cat-${cIdx + 1}`,
        assessmentCode: cat.code,
        assessmentTitle: cat.title,
        employeeId: user.id,
        anonymizedId: user.anonymizedId,
        date: `2026-08-${10 + (cIdx * 4)}`,
        score,
        maxScore: cat.max,
        riskLevel: (riskLevel as any),
        status: (uIdx === 0 && cIdx === 3 ? 'Pending' : 'Completed'),
        summary: riskLevel === 'High'
          ? 'Elevated stress & recovery deficit indicated. Recommended 1-on-1 consultation and micro-breaks.'
          : riskLevel === 'Moderate'
          ? 'Mild fatigue accumulation detected. Maintain sleep discipline and hydrate.'
          : 'Optimal cognitive and emotional stamina profile.',
        recommendations: [
          'Enforce 15-minute cognitive cool-down post high-tempo tasks.',
          'Review continuous screen & field exposure duration.',
          'Schedule active recovery / wellness recharge day.'
        ],
      });
    });
  });

  // 5. Stress Management Metrics (Ingestion & Correlation)
  const stressMetrics: SeededData['stressMetrics'] = allUsers.map((user, idx) => {
    const stressScore = Number((3.2 + ((idx * 1.7) % 6.2)).toFixed(1));
    const workloadHours = Math.round(38 + ((idx * 3.5) % 24));
    const burnoutRisk = stressScore > 7.5 ? 'Critical' : stressScore > 6.0 ? 'High' : stressScore > 4.0 ? 'Moderate' : 'Low';
    return {
      id: `stress-${user.id}`,
      employeeId: user.id,
      anonymizedId: user.anonymizedId,
      department: user.department,
      roleTitle: user.designation,
      stressScore,
      workloadHours,
      burnoutRisk: (burnoutRisk as any),
      sleepDeficitHours: Number((Math.max(0, 8.0 - (6.0 + (idx % 3)))).toFixed(1)),
      fatigueIndex: Math.round(stressScore * 10 + (workloadHours > 45 ? 18 : 0)),
      date: '2026-08-30',
      source: idx % 3 === 0 ? 'PDF Report' : idx % 3 === 1 ? 'Wearable Telemetry' : 'Survey Aggregation',
    };
  });

  // 6. Deployments Records
  const projects = [
    { name: 'Operation Shanti Suraksha (High Altitude Support)', loc: 'Leh-Ladakh Sector', type: 'High-Intensity Field', impact: 'Elevated' },
    { name: 'Unified Grid Modernization Phase 3', loc: 'Bangalore Tech Park', type: 'Hybrid Ops', impact: 'Normal' },
    { name: 'Disaster Relief Telemetry Response', loc: 'Uttarakhand Command', type: 'High-Intensity Field', impact: 'Elevated' },
    { name: 'Centralized Health Tele-Care Infrastructure', loc: 'Hyderabad Hub', type: 'On-Site Office', impact: 'Moderate' },
    { name: 'Secure Border Communications Gateway', loc: 'J&K Border Zone', type: 'High-Intensity Field', impact: 'Elevated' },
    { name: 'Enterprise Cloud Resilience Migration', loc: 'Remote Command', type: 'Remote Command', impact: 'Normal' },
  ];

  const deployments: SeededData['deployments'] = allUsers.slice(0, 15).map((user, idx) => {
    const proj = projects[idx % projects.length];
    return {
      id: `dep-${user.id}`,
      employeeId: user.id,
      anonymizedId: user.anonymizedId,
      employeeName: user.name,
      department: user.department,
      projectName: proj.name,
      role: user.designation,
      startDate: `2026-0${(idx % 6) + 1}-01`,
      endDate: idx % 3 === 0 ? null : `2026-08-${15 + (idx % 10)}`,
      location: proj.loc,
      deploymentType: proj.type as any,
      stressImpact: proj.impact as any,
      status: idx % 3 === 0 ? 'Active' : 'Completed',
      keyMilestones: [
        'Phase 1: Operational readiness assessment passed',
        'Phase 2: Bio-telemetry sensors deployed to unit',
        'Phase 3: Mid-mission psychological support check',
      ],
    };
  });

  // 7. Leave History
  const leaveTypes: SeededData['leaveRecords'][0]['leaveType'][] = [
    'Wellness Recharge', 'Sick Leave', 'Casual Leave', 'Earned Leave'
  ];

  const leaveRecords: SeededData['leaveRecords'] = allUsers.slice(0, 16).map((user, idx) => {
    const lType = leaveTypes[idx % leaveTypes.length];
    return {
      id: `leave-${user.id}-${idx}`,
      employeeId: user.id,
      anonymizedId: user.anonymizedId,
      employeeName: user.name,
      department: user.department,
      leaveType: lType,
      startDate: `2026-08-${(idx % 18) + 2}`,
      endDate: `2026-08-${(idx % 18) + 5}`,
      days: (idx % 3) + 1,
      status: idx % 5 === 0 ? 'Pending' : idx % 6 === 0 ? 'Rejected' : 'Approved',
      reason: lType === 'Wellness Recharge'
        ? 'Preventative mental health recharge and physical recovery.'
        : lType === 'Sick Leave'
        ? 'Viral recovery and fatigue rest.'
        : 'Family obligations and planned respite.',
      appliedDate: `2026-08-01`,
    };
  });

  // 8. Wellness Surveys
  const surveys: SeededData['surveys'] = [
    {
      id: 'srv-001',
      title: 'Q3 Psychological Safety & High-Tempo Operational Resilience',
      description: 'Comprehensive evaluation of team psychological safety, leadership trust, and field workload fatigue.',
      category: 'Workforce Culture',
      targetDepartment: 'All Departments',
      responsesCount: 19,
      totalTarget: 21,
      participationRate: 90.5,
      overallScore: 78,
      status: 'Active',
      createdAt: '2026-08-15',
      dimensions: {
        workLifeBalance: 72,
        psychologicalSafety: 84,
        physicalEnvironment: 80,
        peerSupport: 88,
        leadershipEmpathy: 76,
      },
      sentiment: {
        positive: 68,
        neutral: 22,
        concerning: 10,
      },
      wordCloud: [
        { text: 'Supportive Leadership', value: 42, sentiment: 'pos' },
        { text: 'High Shift Fatigue', value: 36, sentiment: 'neg' },
        { text: 'Peer Camaraderie', value: 38, sentiment: 'pos' },
        { text: 'Night Deployment Stress', value: 29, sentiment: 'neg' },
        { text: 'Wellness Recharge Leave', value: 33, sentiment: 'pos' },
        { text: 'Clear Directives', value: 25, sentiment: 'pos' },
        { text: 'Overtime Logging', value: 22, sentiment: 'neu' },
        { text: 'Hydration & Nutrition', value: 20, sentiment: 'pos' },
        { text: 'Equipment Reliability', value: 18, sentiment: 'neu' },
      ],
      recentFeedback: [
        {
          id: 'fb-1',
          anonymizedId: 'EMP-1004',
          comment: 'The introduction of dedicated Wellness Recharge days significantly alleviated burnout after intense deployments.',
          sentiment: 'Positive',
          date: '2026-08-28',
        },
        {
          id: 'fb-2',
          anonymizedId: 'EMP-1008',
          comment: 'Night shift handovers in Operations are tight, leading to consecutive sleep deficits.',
          sentiment: 'At Risk',
          date: '2026-08-27',
        },
        {
          id: 'fb-3',
          anonymizedId: 'EMP-1012',
          comment: 'Psychological support sessions during Leh deployment were immensely helpful for unit morale.',
          sentiment: 'Positive',
          date: '2026-08-25',
        },
      ],
    },
    {
      id: 'srv-002',
      title: 'Field Equipment Ergonomics & Wearable Comfort Assessment',
      description: 'Review of wearable telemetry accuracy, bio-sensor comfort, and field gear ergonomics.',
      category: 'Physical Well-being',
      targetDepartment: 'Operations & Healthcare',
      responsesCount: 15,
      totalTarget: 16,
      participationRate: 93.7,
      overallScore: 84,
      status: 'Completed',
      createdAt: '2026-07-20',
      dimensions: {
        workLifeBalance: 80,
        psychologicalSafety: 85,
        physicalEnvironment: 86,
        peerSupport: 90,
        leadershipEmpathy: 82,
      },
      sentiment: {
        positive: 78,
        neutral: 16,
        concerning: 6,
      },
      wordCloud: [
        { text: 'Accurate Sleep Tracking', value: 40, sentiment: 'pos' },
        { text: 'Comfortable Bio-Band', value: 34, sentiment: 'pos' },
        { text: 'Battery Life', value: 28, sentiment: 'neu' },
        { text: 'Instant Alert Signal', value: 30, sentiment: 'pos' },
      ],
      recentFeedback: [
        {
          id: 'fb-4',
          anonymizedId: 'EMP-1003',
          comment: 'HRV alerts successfully caught fatigue before operational errors occurred.',
          sentiment: 'Positive',
          date: '2026-07-29',
        },
      ],
    },
  ];

  // 9. Workload Records
  const workload: SeededData['workload'] = allUsers.map((user, idx) => {
    const assignedTasks = 8 + (idx % 9);
    const completedTasks = Math.round(assignedTasks * (0.6 + (idx % 4) * 0.1));
    const weeklyHoursLogged = Math.round(36 + ((idx * 4.3) % 22));
    const capacityHours = 40;
    const utilizationRate = Math.round((weeklyHoursLogged / capacityHours) * 100);
    const overtimeFlag = weeklyHoursLogged > 45;
    const intensityLevel = overtimeFlag ? 'Overloaded' : weeklyHoursLogged > 40 ? 'Heavy' : 'Optimal';
    const sprintStatuses: SeededData['workload'][0]['sprintStatus'][] = ['To Do', 'In Progress', 'Review', 'Blocked'];

    return {
      id: `wl-${user.id}`,
      employeeId: user.id,
      anonymizedId: user.anonymizedId,
      employeeName: user.name,
      department: user.department,
      roleTitle: user.designation,
      assignedTasks,
      completedTasks,
      weeklyHoursLogged,
      capacityHours,
      utilizationRate,
      overtimeFlag,
      intensityLevel: (intensityLevel as any),
      sprintStatus: sprintStatuses[idx % sprintStatuses.length],
    };
  });

  return {
    users: allUsers,
    wearables,
    assessments,
    stressMetrics,
    deployments,
    leaveRecords,
    surveys,
    workload,
  };
}

// Write to JSON database file for persistence
const dbPath = path.resolve(process.cwd(), 'src/db/seededData.json');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const data = generateSeedData();
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`[Seed Generator] Generated ${data.users.length} employees, 90-day wearables, and full dataset at ${dbPath}`);

import {
  User,
  UserRole,
  DashboardStats,
  AssessmentDefinition,
  UserAssessmentResult,
  StressMetric,
  DeploymentRecord,
  LeaveRecord,
  LeaveBalance,
  WellnessSurvey,
  WorkloadRecord,
  WearablesSummary,
} from '../types';

const API_BASE = '/api';

export const api = {
  // 1. Auth
  async login(email?: string, role?: UserRole): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async signup(data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
  }): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  async getDemoUsers(): Promise<{ demoUsers: User[] }> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    if (!res.ok) throw new Error('Failed to fetch demo users');
    return res.json();
  },

  // 2. Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // 3. Assessments
  async getAssessmentDefinitions(): Promise<{ definitions: AssessmentDefinition[] }> {
    const res = await fetch(`${API_BASE}/assessments/definitions`);
    if (!res.ok) throw new Error('Failed to fetch assessment definitions');
    return res.json();
  },

  async getAssessmentHistory(employeeId?: string): Promise<{ assessments: UserAssessmentResult[] }> {
    const url = employeeId
      ? `${API_BASE}/assessments/history?employeeId=${encodeURIComponent(employeeId)}`
      : `${API_BASE}/assessments/history`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch assessment history');
    return res.json();
  },

  async submitAssessment(data: {
    assessmentCode: string;
    employeeId: string;
    answers: Record<string, number> | number[];
  }): Promise<{ success: boolean; result: UserAssessmentResult }> {
    const res = await fetch(`${API_BASE}/assessments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  // 4. Stress Management
  async getStressMetrics(): Promise<{ metrics: StressMetric[]; anonymizedCount: number }> {
    const res = await fetch(`${API_BASE}/stress`);
    if (!res.ok) throw new Error('Failed to fetch stress metrics');
    return res.json();
  },

  async uploadPdf(file: File): Promise<{
    success: boolean;
    message: string;
    extractedCount: number;
    sampleExtracted: StressMetric[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/stress/upload-pdf`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload and parse PDF');
    return res.json();
  },

  async uploadCsv(file: File): Promise<{
    success: boolean;
    message: string;
    extractedCount: number;
    sampleExtracted: StressMetric[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/stress/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload CSV');
    return res.json();
  },

  async manualStressEntry(data: {
    department: string;
    roleTitle: string;
    stressScore: number;
    workloadHours: number;
    burnoutRisk: string;
  }): Promise<{ success: boolean; entry: StressMetric }> {
    const res = await fetch(`${API_BASE}/stress/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit manual stress record');
    return res.json();
  },

  async connectSampleDataset(): Promise<{ success: boolean; message: string; totalRecords: number }> {
    const res = await fetch(`${API_BASE}/stress/sample-dataset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to connect sample dataset');
    return res.json();
  },

  // 5. Deployments
  async getDeployments(filters?: {
    department?: string;
    type?: string;
    status?: string;
  }): Promise<{ deployments: DeploymentRecord[] }> {
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetch(`${API_BASE}/deployments?${params}`);
    if (!res.ok) throw new Error('Failed to fetch deployment records');
    return res.json();
  },

  // 6. Leave
  async getLeave(employeeId?: string): Promise<{ records: LeaveRecord[]; balance: LeaveBalance }> {
    const url = employeeId ? `${API_BASE}/leave?employeeId=${encodeURIComponent(employeeId)}` : `${API_BASE}/leave`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leave history');
    return res.json();
  },

  async applyLeave(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }): Promise<{ success: boolean; record: LeaveRecord }> {
    const res = await fetch(`${API_BASE}/leave/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to apply for leave');
    return res.json();
  },

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected'): Promise<{ success: boolean; record: LeaveRecord }> {
    const res = await fetch(`${API_BASE}/leave/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update leave status');
    return res.json();
  },

  // 7. Surveys
  async getSurveys(): Promise<{ surveys: WellnessSurvey[] }> {
    const res = await fetch(`${API_BASE}/surveys`);
    if (!res.ok) throw new Error('Failed to fetch surveys');
    return res.json();
  },

  async createSurvey(data: {
    title: string;
    description: string;
    category: string;
    targetDepartment: string;
  }): Promise<{ success: boolean; survey: WellnessSurvey }> {
    const res = await fetch(`${API_BASE}/surveys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create survey');
    return res.json();
  },

  // 8. Workload
  async getWorkload(): Promise<{
    workload: WorkloadRecord[];
    summary: {
      totalTasks: number;
      completedTasks: number;
      overtimeCount: number;
      avgUtilization: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/workload`);
    if (!res.ok) throw new Error('Failed to fetch workload records');
    return res.json();
  },

  // 9. Wearables
  async getWearables(employeeId?: string, days = '30'): Promise<WearablesSummary & { days: number }> {
    const url = `${API_BASE}/wearables?employeeId=${encodeURIComponent(employeeId || '')}&days=${days}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch wearable telemetry');
    return res.json();
  },
};

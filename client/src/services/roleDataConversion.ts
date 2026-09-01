import { UserRole } from '../types';

/**
 * Role-Based Data Conversion System
 * Converts data between different role perspectives while maintaining privacy and security
 * Backend-driven data transformation for seamless role switching
 */

export interface RoleBasedMetrics {
  role: UserRole;
  readinessScore: number;
  stressIndex: number;
  fatigueFlags: number;
  restAuthorizations: number;
  personnelCount: number;
  warningCount: number;
  lastSyncTime: string;
}

export interface RoleBasedBattalionData {
  id: string;
  name: string;
  location: string;
  readiness: number;
  stress: number;
  workload: number;
  personnelCount: number;
  alerts: number;
  // Role-specific fields
  personalBiometrics?: {
    heartRate: number;
    spo2: number;
    hrv: number;
  };
  clinicalNotes?: string;
  commanderNotes?: string;
}

export interface RoleBasedAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  affectedEntities: string[]; // Battalion names, personnel IDs, etc.
  actionRequired: string;
  timestamp: string;
  visibleToRoles: UserRole[];
}

/**
 * Core data conversion logic
 * This would typically call the backend API with role parameter
 * Backend performs row-level security and data anonymization
 */
export const convertDataForRole = async (
  originalData: any,
  sourceRole: UserRole,
  targetRole: UserRole,
  endpoint: string
): Promise<any> => {
  // In production, this would call your backend
  // Example: POST /api/data-convert?from=commander&to=welfare_officer
  try {
    const response = await fetch(`${endpoint}?sourceRole=${sourceRole}&targetRole=${targetRole}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(originalData),
    });

    if (!response.ok) {
      throw new Error(`Data conversion failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error converting data for role:', error);
    return originalData; // Fallback to original data
  }
};

/**
 * Role-specific data masking and transformation
 */
export const transformMetricsForRole = (metrics: any, role: UserRole): RoleBasedMetrics => {
  const base: RoleBasedMetrics = {
    role,
    readinessScore: metrics.readinessScore || 0,
    stressIndex: metrics.avgStress || 0,
    fatigueFlags: metrics.fatigueOutposts || 0,
    restAuthorizations: metrics.restAuthorizations || 0,
    personnelCount: metrics.totalPersonnel || 0,
    warningCount: metrics.activeAlerts || 0,
    lastSyncTime: metrics.lastSyncTime || 'Just now',
  };

  switch (role) {
    case 'personnel':
      // Personnel only see their own data
      return {
        ...base,
        personnelCount: 1, // Just themselves
        readinessScore: metrics.personalReadiness || metrics.readinessScore,
        stressIndex: metrics.personalStress || metrics.avgStress,
      };

    case 'welfare_officer':
      // Welfare officers see clinical data for their units
      return {
        ...base,
        warningCount: metrics.clinicalAlerts || metrics.activeAlerts,
        // Can see detailed stress/fatigue metrics
      };

    case 'commander':
      // Commanders see aggregated battalion data
      return {
        ...base,
        personnelCount: metrics.totalPersonnel || 0,
        warningCount: metrics.commandLevelAlerts || metrics.activeAlerts,
      };

    case 'analyst':
      // Analysts see anonymized, aggregated data only
      return {
        ...base,
        personnelCount: metrics.anonymizedPersonnelCount || 0,
        readinessScore: Math.round(metrics.readinessScore), // Round for privacy
        stressIndex: Math.round(metrics.avgStress * 10) / 10,
      };

    default:
      return base;
  }
};

/**
 * Transform battalion data based on viewing role
 */
export const transformBattalionDataForRole = (
  battalionData: any,
  role: UserRole
): RoleBasedBattalionData => {
  const base: RoleBasedBattalionData = {
    id: battalionData.id || '',
    name: battalionData.name || '',
    location: battalionData.location || '',
    readiness: battalionData.readiness || 0,
    stress: battalionData.stress || 0,
    workload: battalionData.workload || 0,
    personnelCount: battalionData.personnelCount || 0,
    alerts: battalionData.alerts || 0,
  };

  switch (role) {
    case 'personnel':
      // Only see aggregated unit-level data, no personnel-specific details
      return {
        ...base,
        personnelCount: 0, // Hidden
        alerts: 0, // Hidden
      };

    case 'welfare_officer':
      // Can see clinical data and health metrics
      return {
        ...base,
        personalBiometrics: battalionData.personalBiometrics,
        clinicalNotes: battalionData.clinicalNotes,
      };

    case 'commander':
      // Full access to battalion data with commander notes
      return {
        ...base,
        commanderNotes: battalionData.commanderNotes,
      };

    case 'analyst':
      // Anonymized data only - no identifiable information
      return {
        ...base,
        name: `Battalion-${base.id.substring(0, 4)}`, // Anonymize name
        location: 'Aggregated Region', // Generalize location
        personnelCount: Math.round(battalionData.personnelCount / 10) * 10, // Round to nearest 10
      };

    default:
      return base;
  }
};

/**
 * Filter alerts based on role visibility
 */
export const filterAlertsForRole = (alerts: RoleBasedAlert[], role: UserRole): RoleBasedAlert[] => {
  return alerts
    .filter((alert) => alert.visibleToRoles.includes(role))
    .map((alert) => {
      if (role === 'analyst' || role === 'personnel') {
        // Anonymize sensitive information
        return {
          ...alert,
          affectedEntities: alert.affectedEntities.map(() => 'Unit-[MASKED]'),
        };
      }
      return alert;
    });
};

/**
 * Merge datasets from different roles
 * Useful for showing comparative analysis
 */
export const mergeRoleDatasets = (datasets: Map<UserRole, any>): any => {
  const merged = {
    personnelMetrics: datasets.get('personnel'),
    welfarMetrics: datasets.get('welfare_officer'),
    commanderMetrics: datasets.get('commander'),
    analystMetrics: datasets.get('analyst'),
  };

  return merged;
};

/**
 * Hook for role-based data management
 */
export const useRoleBasedDataConversion = () => {
  return {
    convertData: convertDataForRole,
    transformMetrics: transformMetricsForRole,
    transformBattalionData: transformBattalionDataForRole,
    filterAlerts: filterAlertsForRole,
    mergeDatasets: mergeRoleDatasets,
  };
};

/**
 * Backend API helpers for role-based queries
 */
export const rolBasedApiHelpers = {
  /**
   * Fetch data for a specific role
   */
  fetchDataForRole: async (endpoint: string, role: UserRole, filters?: any) => {
    const queryParams = new URLSearchParams({
      role,
      ...filters,
    });

    const response = await fetch(`${endpoint}?${queryParams}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data for role ${role}`);
    }

    return await response.json();
  },

  /**
   * Convert data between roles
   */
  convertBetweenRoles: async (
    dataToConvert: any,
    sourceRole: UserRole,
    targetRole: UserRole,
    endpoint: string = '/api/data-conversion'
  ) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: dataToConvert,
        sourceRole,
        targetRole,
      }),
    });

    if (!response.ok) {
      throw new Error('Data conversion failed');
    }

    return await response.json();
  },

  /**
   * Stream live data for a role
   */
  streamDataForRole: (endpoint: string, role: UserRole, onData: (data: any) => void) => {
    const eventSource = new EventSource(`${endpoint}?role=${role}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onData(data);
    };

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      eventSource.close();
    };

    return eventSource;
  },
};

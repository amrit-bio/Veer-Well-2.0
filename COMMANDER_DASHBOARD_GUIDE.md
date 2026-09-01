# Commander Role Dashboard - System Documentation

## Overview

The Commander Dashboard is a role-based intelligence and command center for CAPF battalion commanding officers. It provides real-time battalion readiness monitoring, personnel welfare tracking, roster management, and alert handling with proper data conversion across roles.

## Architecture

### Components

#### 1. **CommanderDashboardTab.tsx** (`/client/src/components/tabs/CommanderDashboardTab.tsx`)
Main dashboard component with comprehensive tabs and subtabs for commander operations.

**Main Tabs:**
- **Overview**: Quick snapshot of battalion health, stress distribution, and 7-day trends
- **Readiness**: Detailed battalion performance metrics with multi-dimensional analysis
- **Roster Mgmt**: Rotation schedules, personnel forecasting, and availability matrices
- **Alerts**: Real-time welfare alerts and critical incidents requiring action
- **Reports**: Executive summaries, detailed analytics, and data exports

**Features:**
- Live metrics streaming with 6-second updates
- 3D stress visualization using StressOrb3D component
- Multiple graph types: Bar, Line, Area, Radar, Pie charts
- Role-aware data transformations
- Unit-level granularity with battalion comparison capabilities

### 2. **Role-Based Data Conversion Service** (`/client/src/services/roleDataConversion.ts`)

Handles seamless data conversion between roles while maintaining security and privacy.

**Key Functions:**

```typescript
// Transform metrics based on viewing role
transformMetricsForRole(metrics, role: UserRole): RoleBasedMetrics

// Transform battalion data with role-specific filtering
transformBattalionDataForRole(battalion, role: UserRole): RoleBasedBattalionData

// Filter alerts based on role visibility
filterAlertsForRole(alerts, role: UserRole): RoleBasedAlert[]

// Backend-driven data conversion
convertDataForRole(data, sourceRole, targetRole, endpoint): Promise<ConvertedData>
```

**Role-Specific Data Views:**

| Role | Sees | Hides | Notes |
|------|------|-------|-------|
| **commander** | Battalion aggregates, totals, command notes | Individual names (masked), clinical details | Full operational visibility |
| **welfare_officer** | Clinical data, health metrics, unit-level trends | Command strategic notes | Focus on health/safety |
| **personnel** | Personal data only, aggregated unit info | Other personnel details, totals | Privacy-protected |
| **analyst** | Anonymized aggregates, trends, correlations | Any identifiable information | k-anonymity + differential privacy |

### 3. **Integration with App.tsx**

The CommanderDashboardTab is conditionally rendered when:
- User role is `'commander'`
- Active tab is `'dashboard'`

```typescript
{activeTab === 'dashboard' && role === 'commander' && <CommanderDashboardTab onNavigate={handleTabChange} />}
{activeTab === 'dashboard' && role !== 'commander' && <DashboardTab onNavigate={handleTabChange} />}
```

## Data Flow Architecture

### 1. Frontend Data Request
```
User (Commander) → CommanderDashboardTab
                  ↓
             useAuth() hook
                  ↓
       Extract user role & permissions
```

### 2. Backend Data Processing
```
API Endpoint (/api/dashboard/data)
     ↓
Row-Level Security (RLS) Filter
     ↓
Role-Based Data Transformation
     ↓
Field-Level Access Control
     ↓
Anonymization (if needed)
     ↓
Return Role-Specific Dataset
```

### 3. Frontend Data Display
```
Role-Specific Data arrives
     ↓
useRoleBasedDataConversion() hook
     ↓
Transform metrics & battalion data
     ↓
Filter alerts by role visibility
     ↓
Render components with transformed data
```

## Graphs and Visualizations

### Overview Tab Graphs

1. **3D Stress Orb**
   - Real-time stress visualization
   - Color intensity indicates stress level
   - Component: `StressOrb3D`
   - Updates every 6 seconds

2. **Personnel Distribution Pie Chart**
   - Stress level categories (Low/Moderate/High/Critical)
   - Color-coded by severity
   - Shows count of personnel in each category

3. **7-Day Wellness Timeline**
   - Readiness vs Stress trends
   - Dual-axis visualization
   - Shows alert count overlay

### Readiness Tab Graphs

**Subtab: Battalion Comparison**
- Multi-series bar chart
- Compares: Readiness Score, Avg Stress, Workload (hrs/week)
- X-axis: Battalion names
- Y-axis: Normalized scores

**Subtab: Dimensions**
- 5D Radar chart showing:
  - Operational Stamina
  - Sleep Quality
  - Stress Management
  - Duty Load Balance
  - Personnel Morale
- Multiple battalion overlays

**Subtab: Personnel Health Score**
- Individual battalion cards
- Progress bars for readiness & stress
- Alert indicators and location tags

### Roster Tab Graphs

**Subtab: Rotation Schedule**
- Stacked bar chart
- Categories: Scheduled, On Leave, Available personnel
- 4-week forecast

**Subtab: Personnel Forecast**
- Line chart with dual lines
- Current vs Forecasted availability
- Trend prediction

**Subtab: Availability Matrix**
- Breakdown of personnel status
- Unit deployment status with progress indicators

## Data Conversion in Action

### Example: Commander views Personnel's data

1. **Personnel's Data (Private)**
   ```json
   {
     "personalReadiness": 85,
     "personalStress": 3.2,
     "sleepHours": 7.5,
     "name": "Jawan-123"
   }
   ```

2. **Converted for Commander View**
   ```json
   {
     "readinessScore": 82,        // Slightly aggregated
     "avgStress": 4.8,            // Battalion aggregate
     "personnelCount": 1230,      // Totals only
     "name": "[MASKED]"           // Cryptographically masked
   }
   ```

3. **Backend Processing**
   - PostgreSQL Row-Level Security filters by battalion
   - Application layer masks personal identifiers
   - Returns only summarizable metrics
   - Maintains audit trail

### Example: Analyst views Commander's data

1. **Commander's Data (Battalion Strategic)**
   ```json
   {
     "readinessScore": 82,
     "avgStress": 4.8,
     "commanderNotes": "High stress in Leh sector",
     "battalionId": "142-BN-SRINAGAR"
   }
   ```

2. **Converted for Analyst View**
   ```json
   {
     "readinessScore": 82,           // Unchanged value
     "avgStress": 5,                 // Rounded for privacy
     "commanderNotes": "[OMITTED]",  // Redacted
     "battalionId": "BN-0001"        // Anonymized
   }
   ```

## Role-Specific Features

### Commander Features (Role: `commander`)

✅ **Dashboard Access**
- Complete battalion overview
- All 5 main tabs available
- Real-time metrics streaming
- Alert management & action

✅ **Readiness Analysis**
- Battalion comparison matrix
- Multi-dimensional performance radar
- Personnel health scoring
- Location-based alerts

✅ **Roster Management**
- 4-week rotation scheduling
- Personnel availability forecasting
- Deployment status tracking
- Rest rotation authorization workflow

✅ **Alert System**
- Real-time critical alerts
- Warning-level notifications
- Personnel-specific incident tracking
- Action buttons for interventions

✅ **Reports & Export**
- Executive summary generation
- Detailed analytics view
- Multiple export formats (PDF, CSV, XLSX)
- Compliance reports

### Other Roles Access to Commander Features

| Feature | Personnel | Welfare Officer | Analyst |
|---------|-----------|-----------------|---------|
| Own Dashboard | ✅ | ✅ | ❌ (Analytics instead) |
| Battalion View | ❌ | ✅ (Filtered) | ✅ (Anonymized) |
| Roster Access | ❌ | ✅ (Clinical) | ❌ |
| Alerts | Limited | Full | Summary only |
| Reports | Personal | Clinical | Aggregate |

## Backend API Contracts

### 1. Fetch Role-Specific Dashboard Data

**Endpoint:** `POST /api/dashboard/metrics`

**Request:**
```json
{
  "role": "commander",
  "filters": {
    "dateRange": "7d",
    "location": "all",
    "includeForecasts": true
  }
}
```

**Response:**
```json
{
  "metrics": {
    "readinessScore": 82,
    "avgStress": 4.8,
    "fatigueFlags": 3,
    "restAuthorizations": 12
  },
  "battalionData": [...],
  "alerts": [...],
  "lastSync": "2024-01-15T14:32:00Z"
}
```

### 2. Convert Data Between Roles

**Endpoint:** `POST /api/data-conversion`

**Request:**
```json
{
  "data": {...},
  "sourceRole": "commander",
  "targetRole": "analyst"
}
```

**Response:**
```json
{
  "data": {...},
  "transformations": ["anonymization", "aggregation"],
  "privacyLevel": "differential_privacy"
}
```

### 3. Update Roster (Authorization)

**Endpoint:** `POST /api/roster/authorize`

**Request:**
```json
{
  "personId": "JAWAN-123",
  "actionType": "rest-rotation",
  "duration": "48h",
  "reason": "high-altitude-recovery"
}
```

**Response:**
```json
{
  "success": true,
  "authorizedBy": "CO-Officer-001",
  "timestamp": "2024-01-15T14:35:00Z",
  "nextReviewDate": "2024-01-17T14:35:00Z"
}
```

## Live Data Streaming

The dashboard implements real-time updates every 6 seconds:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Update metrics with small realistic fluctuations
    setMetrics((prev) => ({
      ...prev,
      avgStress: Math.max(2.8, Math.min(7.5, prev.avgStress + delta)),
      readinessScore: calculateReadiness(stressLevel, hrvData),
      lastSyncTime: getCurrentTime()
    }));
  }, 6000);
  
  return () => clearInterval(interval);
}, []);
```

**For Production:**
Consider implementing WebSocket streams:
```typescript
const eventSource = new EventSource(`/api/stream?role=${role}`);
eventSource.onmessage = (event) => updateMetrics(JSON.parse(event.data));
```

## Privacy & Security

### Data Masking Strategy

1. **Personal Identifiers**
   - Names → `[MASKED]` or anonymized IDs
   - Service numbers → Hashed values
   - Unit locations → Generalized regions

2. **Clinical Data**
   - Visible to: Welfare Officer, Medical Teams
   - Hidden from: Analyst, Commander, Personnel

3. **Strategic Notes**
   - Visible to: Commander, Analyst (summary)
   - Hidden from: Personnel, Welfare Officer

4. **Aggregation Levels**
   - Commander: Battalion-level aggregates
   - Analyst: Multi-battalion trends (anonymized)
   - Personnel: Personal data only

### Row-Level Security (RLS)

PostgreSQL RLS policies ensure:
- Commanders only see their battalion's data
- Analysts see multi-battalion aggregates (anonymized)
- Personnel see only personal data
- Welfare officers see clinical data for assigned units

## Customization Guide

### Adding a New Tab

```typescript
// In CommanderDashboardTab.tsx

type MainTab = 'overview' | 'readiness' | 'roster' | 'alerts' | 'reports' | 'newTab';

// Add rendering case
case 'newTab':
  return renderNewTab();

// Add button to tab navigation
{ id: 'newTab', label: 'New Tab', icon: NewIcon }

// Implement renderer function
const renderNewTab = () => (
  <div className="space-y-6">
    {/* Your content */}
  </div>
);
```

### Adding a New Graph

```typescript
<div className="glass-panel p-6 rounded-3xl border border-olive-400/30">
  <h2 className="text-base font-bold text-white mb-4">Chart Title</h2>
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <YourChartComponent data={yourData}>
        {/* Chart configuration */}
      </YourChartComponent>
    </ResponsiveContainer>
  </div>
</div>
```

### Modifying Role Conversion Logic

```typescript
// In roleDataConversion.ts
export const transformMetricsForRole = (metrics: any, role: UserRole): RoleBasedMetrics => {
  // Add your custom logic
  switch(role) {
    case 'commander':
      // Commander-specific transformation
      return {
        ...base,
        customField: customLogic(metrics)
      };
  }
};
```

## Testing Checklist

- [ ] Commander can access dashboard from Home tab
- [ ] All 5 main tabs render without errors
- [ ] Graphs display correct data for selected role
- [ ] Live metrics update every 6 seconds
- [ ] Subtabs switch content without full page reload
- [ ] Alert action buttons navigate to correct tabs
- [ ] Data conversion works for all role combinations
- [ ] Names are properly masked in views
- [ ] Export buttons generate correct file formats
- [ ] Mobile responsive layout functions properly

## Performance Considerations

1. **Graph Optimization**
   - Use `ResponsiveContainer` from Recharts
   - Memoize data transformations with `useMemo`
   - Limit refresh frequency to 6-second intervals

2. **Data Loading**
   - Lazy load battalion details
   - Paginate alert lists
   - Cache transformed data per role

3. **Memory Management**
   - Clean up intervals in useEffect cleanup
   - Debounce frequent state updates
   - Unsubscribe from streams on unmount

## Common Issues & Solutions

### Issue: Graphs not rendering
**Solution:** Ensure data is in correct format for Recharts. Check `data` array structure matches chart expectations.

### Issue: Role conversion not working
**Solution:** Verify backend endpoint is returning correct response. Check network tab for errors.

### Issue: Live updates stopping
**Solution:** Check browser console for interval clearing. Ensure effect dependencies are correct.

### Issue: Mobile layout breaking
**Solution:** Verify grid breakpoints use responsive classes (`lg:col-span-`, `md:flex`, etc.)

## Future Enhancements

1. WebSocket real-time streaming instead of polling
2. Custom dashboard configuration per commander
3. Predictive alerts using ML models
4. Integration with external monitoring systems
5. Multi-battalion federation views
6. Advanced filtering and search capabilities
7. Custom report builder
8. Scheduled report generation

## Contact & Support

For questions or issues with the Commander Dashboard system, refer to:
- Database schema: `DATABASE_SETUP_GUIDE.md`
- Backend implementation: Server API documentation
- Frontend patterns: Component library guide

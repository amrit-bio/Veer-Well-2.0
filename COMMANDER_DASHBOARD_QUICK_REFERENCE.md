# Commander Dashboard - Quick Reference Guide

## Tab Navigation Map

```
COMMANDER DASHBOARD
│
├─ 🏠 OVERVIEW (Default View)
│  ├─ Top Section: 4 Metric Cards
│  │  ├─ Battalion Readiness Index (0-100)
│  │  ├─ Avg Stress Index (0-10)
│  │  ├─ Fatigue Outpost Flags (Count)
│  │  └─ Pending Rest Authorizations (Count)
│  │
│  ├─ Middle Section: 3D + Pie Chart
│  │  ├─ 3D Stress Orb Centerpiece
│  │  └─ Personnel Distribution (Stress Levels)
│  │
│  └─ Bottom Section: Timeline
│     └─ 7-Day Personnel Wellness Trend
│
├─ 📊 READINESS (Performance Analysis)
│  ├─ [Battalion Comparison]
│  │  └─ Bar Chart: Readiness, Stress, Workload by Unit
│  ├─ [Dimensions]
│  │  └─ Radar Chart: 5D readiness across battalions
│  └─ [Personnel Health]
│     └─ Individual unit cards with health indicators
│
├─ 📅 ROSTER MANAGEMENT (Scheduling)
│  ├─ [Rotation Schedule]
│  │  └─ Bar Chart: 4-week personnel allocation
│  ├─ [Personnel Forecast]
│  │  └─ Line Chart: Availability trends with prediction
│  └─ [Availability Matrix]
│     └─ Status breakdown by unit
│
├─ ⚠️  ALERTS (Real-Time Monitoring)
│  └─ Alert Stream
│     ├─ 🚨 Critical Alerts (Red)
│     ├─ ⚠️  Warnings (Orange)
│     └─ ℹ️  Informational (Blue)
│
└─ 📈 REPORTS (Analysis & Export)
   ├─ [Executive Summary]
   │  ├─ Weekly Command Report
   │  ├─ Key Improvements
   │  └─ Areas of Concern
   ├─ [Detailed Analytics]
   │  └─ 14-Day detailed trend analysis
   └─ [Export Data]
      ├─ Battalion Summary Report (PDF)
      ├─ Personnel Health Data (CSV)
      ├─ Roster Schedule (XLSX)
      └─ Compliance Report (PDF)
```

## Data Conversion Matrix

```
                    Commander      Welfare Officer    Personnel       Analyst
                    =========      ==============     =========       =======
Show Totals?        ✅ YES         ✅ FILTERED       ❌ NO           ✅ ROUNDED
Show Names?         ❌ MASKED      ⚠️  LIMITED       ❌ MASKED       ❌ MASKED
Show Clinical?      ⚠️  LIMITED    ✅ FULL          ❌ NO           ❌ NO
Show Strategic?     ✅ YES         ❌ NO             ❌ NO           ⚠️  SUMMARY
Aggregation Level   Battalion      Unit             Personal        Multi-BN
Data Detail         High           Medium           Personal        Low (Privacy)
```

## Component Imports Reference

```typescript
// In App.tsx
import { CommanderDashboardTab } from './components/tabs/CommanderDashboardTab';

// Conditional Rendering
{activeTab === 'dashboard' && role === 'commander' && <CommanderDashboardTab onNavigate={handleTabChange} />}
{activeTab === 'dashboard' && role !== 'commander' && <DashboardTab onNavigate={handleTabChange} />}
```

## Key Metrics & Their Ranges

```
┌─ Battalion Readiness Index
│  Range: 0-100 (100 = Perfect)
│  Green: 80-100  |  Yellow: 60-80  |  Red: <60
│
├─ Average Stress Index
│  Range: 0-10 (10 = Extremely Stressed)
│  Green: 1-3  |  Yellow: 4-6  |  Red: 7-10
│
├─ Fatigue Outpost Flags
│  Count: Number of outposts with fatigue issues
│  Shows: Specific units requiring intervention
│
└─ Pending Rest Authorizations
   Count: Number of rotation requests awaiting approval
   Shows: Queue status for rest/recovery protocols
```

## Live Update Mechanism

```
Every 6 seconds:
┌─────────────────────────┐
│  setInterval(() => {    │
│    metrics.stress       │→ ±0.2 random change
│    metrics.readiness    │→ Recalculated
│    metrics.timestamp    │→ Updated time
│  }, 6000)              │
└─────────────────────────┘
       ↓
    Recharts graphs
    Auto-re-render
```

## Alert Severity Levels

```
🚨 CRITICAL (Red)
   Example: High altitude circadian strain
   Action: Immediate intervention required
   Visible to: All roles (data masked appropriately)

⚠️  WARNING (Orange)
   Example: Workload saturation detected
   Action: Scheduled intervention
   Visible to: Commander, Welfare Officer, Analyst (filtered)

ℹ️  INFO (Blue)
   Example: Wellness milestone achieved
   Action: Acknowledge/Celebrate
   Visible to: All roles
```

## Graph Types & When Used

```
📊 BAR CHART
   Use: Categorical comparisons (battalions, weeks)
   Example: Readiness score by battalion

📈 LINE CHART
   Use: Trends over time with predictions
   Example: Personnel forecast (current vs predicted)

📉 AREA CHART
   Use: Stacked metrics showing composition
   Example: Wellness timeline (readiness + stress)

🎯 RADAR CHART
   Use: Multi-dimensional performance analysis
   Example: 5D readiness dimensions comparison

🥧 PIE CHART
   Use: Distribution and composition
   Example: Personnel by stress level

🔴 3D ORB
   Use: Single metric with visual intensity
   Example: Overall battalion stress level
```

## Mobile Responsive Breakpoints

```
Mobile (<640px)     : Stacked layout, single column
Tablet (640-1024px) : 2 columns, adjusted sizing
Desktop (>1024px)   : Full 3-4 column grids
```

## Common Navigation Flows

### Flow 1: Quick Health Check
```
Overview Tab
  → See 4 metric cards
  → Check 3D stress orb
  → View 7-day trend
```

### Flow 2: Detailed Battalion Analysis
```
Readiness Tab
  → Battalion Comparison subtab
  → Switch to Dimensions subtab
  → View Personnel Health cards
```

### Flow 3: Personnel Management
```
Roster Tab
  → Check current schedule
  → Review forecast
  → Review availability matrix
```

### Flow 4: Incident Response
```
Alerts Tab
  → See critical alerts at top
  → Click "Act Now" button
  → Navigate to Interventions
```

### Flow 5: Generate Report
```
Reports Tab
  → Executive Summary subtab (read brief)
  → Detailed Analytics subtab (dive deep)
  → Export Data subtab (download files)
```

## Data Privacy Hierarchy

```
LEVEL 1: Personal Data (Most Private)
├─ Individual names
├─ Clinical notes
├─ Personal metrics
└─ Private assessments
   └─ Only visible to: Personnel + Medical team

LEVEL 2: Unit-Level Data
├─ Battalion aggregates
├─ Aggregated stress/readiness
├─ Unit health metrics
└─ Roster information
   └─ Only visible to: Commander + Welfare Officer

LEVEL 3: Strategic Data
├─ Multi-battalion trends
├─ Comparative analysis
├─ Strategic recommendations
└─ Executive insights
   └─ Visible to: Commander + Analyst (different masks)

LEVEL 4: Anonymized Data (Least Private)
├─ k-anonymity groups (k=5)
├─ Differential privacy applied (ε=0.5)
├─ Trend analysis only
└─ No identifiable information
   └─ Visible to: Analyst only
```

## Keyboard Shortcuts (Future Enhancement)

```
Ctrl/Cmd + 1 → Overview
Ctrl/Cmd + 2 → Readiness
Ctrl/Cmd + 3 → Roster
Ctrl/Cmd + 4 → Alerts
Ctrl/Cmd + 5 → Reports
Ctrl/Cmd + R → Refresh data
Ctrl/Cmd + E → Export current view
```

## API Response Structure (Expected)

```json
{
  "metrics": {
    "readinessScore": 84,
    "avgStress": 4.8,
    "fatigueFlags": 3,
    "restAuthorizations": 12,
    "personnelCount": 1230,
    "warningCount": 8,
    "lastSyncTime": "2024-01-15T14:32:00Z"
  },
  "battalionData": [
    {
      "name": "142 Bn (Srinagar)",
      "readiness": 76,
      "stress": 5.8,
      "workload": 52,
      "personnel": 450,
      "alerts": 3,
      "location": "Srinagar Sector"
    }
  ],
  "alerts": [
    {
      "id": "alert-1",
      "type": "critical",
      "title": "Alert Title",
      "message": "Alert message",
      "affectedPersonnel": 3,
      "timestamp": "2024-01-15T14:20:00Z"
    }
  ],
  "trends": {
    "readiness7day": [...],
    "stress7day": [...],
    "alertCount7day": [...]
  }
}
```

## Performance Metrics Target

```
Loading Time:      < 2 seconds
Tab Switch:        < 300ms
Graph Render:      < 500ms
Data Update:       6 seconds (configurable)
Mobile FPS:        60 FPS (smooth scrolling)
Bundle Size:       < 500KB additional
```

## Color Coding Reference

```
Accent Gold     (#EAB308)  → Success, Primary action, Trends
Rose/Red        (#EF4444)  → Critical, High stress, Danger
Emerald Green   (#10B981)  → Good health, Safe, Recovery
Amber/Orange    (#F97316)  → Warning, Caution, Moderate risk
Cyan            (#06B6D4)  → Informational, Secondary action
Olive           (#8faa80)  → Background, Neutral, Secondary
Navy            (#001F3F)  → Primary background
```

---

**Quick Start:** Login as Commander → View Dashboard → Explore all 5 tabs → Try role conversion

**Documentation:** See COMMANDER_DASHBOARD_GUIDE.md for complete reference

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TABS } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AiWelfareCopilot } from './components/common/AiWelfareCopilot';
import { AuthModal } from './components/auth/AuthModal';
import { BrandedLoader } from './components/common/BrandedLoader';
import { HomeOverviewTab } from './components/tabs/HomeOverviewTab';

import { DashboardTab } from './components/tabs/DashboardTab';
import { CommanderDashboardTab } from './components/tabs/CommanderDashboardTab';
import { SelfAssessmentTab } from './components/tabs/SelfAssessmentTab';
import { PredictiveAnalyticsTab } from './components/tabs/PredictiveAnalyticsTab';
import { InterventionsTab } from './components/tabs/InterventionsTab';
import { PrivacySecurityTab } from './components/tabs/PrivacySecurityTab';
import { DatasetsSimulationTab } from './components/tabs/DatasetsSimulationTab';
import { ImpactBenefitsTab } from './components/tabs/ImpactBenefitsTab';
import { HackathonAboutTab } from './components/tabs/HackathonAboutTab';
import { IntegrationsTab } from './components/tabs/IntegrationsTab';
import { FeedbackTab } from './components/tabs/FeedbackTab';
import { SupabaseDataTab } from './components/tabs/SupabaseDataTab';
import { ClinicalDashboardTab } from './components/tabs/ClinicalDashboardTab';
import { DeploymentLogisticsTab } from './components/tabs/DeploymentLogisticsTab';
import { AlgorithmTelemetryTab } from './components/tabs/AlgorithmTelemetryTab';
import { VoiceAssistantTab } from './components/tabs/VoiceAssistantTab';
import { PeerSupportTab } from './components/tabs/PeerSupportTab';
import { SupabaseAuth } from './components/auth/SupabaseAuth';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { getDefaultTabForRole, getVisibleTabsForRole, isTabAccessible } from './config/navConfig';
import { useAuth } from './context/AuthContext';
import { BrandLogo } from './components/common/BrandLogo';
import { Shield, Database, LogIn, Sparkles, ArrowRight } from 'lucide-react';

const MainPlatform: React.FC = () => {
  const { isAuthenticated, session, authLoading, switchRole, role, supabaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [bootLoading, setBootLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [supabaseMessage, setSupabaseMessage] = useState('');
  const [showStatus, setShowStatus] = useState(true);
  const [demoBypass, setDemoBypass] = useState(false);
  const previousAccountId = useRef<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setBootLoading(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  // ── Supabase Connection Test ──────────────────────────────────────
  useEffect(() => {
    async function testSupabaseConnection() {
      try {
        console.log('[VeerWell] 🔌 Testing Supabase connection...');
        const startTime = performance.now();

        // Query the real profiles table to verify connection + schema
        const { data, error, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const elapsed = Math.round(performance.now() - startTime);

        if (error) {
          console.error('[VeerWell] ❌ Supabase connection error:', error.message);
          setSupabaseStatus('error');
          setSupabaseMessage(`Error: ${error.message}`);
        } else {
          console.log(`[VeerWell] ✅ Supabase connected successfully (${elapsed}ms)`);
          console.log(`[VeerWell] 📊 Profiles table: ${count ?? 0} rows`);

          // Quick health check — verify all core tables are accessible
          const tables = [
            'profiles', 'wearable_telemetry', 'assessments', 'stress_metrics',
            'deployments', 'leave_records', 'wellness_surveys', 'survey_responses',
            'workload_records', 'interventions', 'welfare_alerts', 'feedback',
          ];
          let tablesOk = 0;
          for (const t of tables) {
            const { error: tErr } = await supabase.from(t).select('*', { head: true, count: 'exact' });
            if (!tErr) tablesOk++;
          }

          console.log(`[VeerWell] 🗄️  Tables verified: ${tablesOk}/${tables.length}`);
          setSupabaseStatus('connected');
          setSupabaseMessage(`Connected in ${elapsed}ms — ${tablesOk}/${tables.length} tables OK, ${count ?? 0} profiles`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[VeerWell] ❌ Supabase connection failed:', message);
        setSupabaseStatus('error');
        setSupabaseMessage(`Failed: ${message}`);
      }
    }

    testSupabaseConnection();
  }, []);


  const handleTabChange = (tabId: string) => {
    // Never render a module outside the active account's assigned role.
    if (!isTabAccessible(tabId, role)) {
      setActiveTab(getDefaultTabForRole(role));
      return;
    }
    if (tabId === activeTab) return;
    setTabLoading(true);
    setActiveTab(tabId);
    window.setTimeout(() => setTabLoading(false), 420);
  };

  // A sign-in, sign-out, or role change always starts at the permitted home view.
  // This prevents the previous account's screen from briefly remaining visible.
  useEffect(() => {
    const accountId = supabaseUser?.id ?? null;
    if (previousAccountId.current !== accountId) {
      previousAccountId.current = accountId;
      setActiveTab(getDefaultTabForRole(role));
      return;
    }

    if (!isTabAccessible(activeTab, role)) {
      setActiveTab(getDefaultTabForRole(role));
    }
  }, [activeTab, role, supabaseUser?.id]);

  if (bootLoading || authLoading) {
    return <BrandedLoader fullscreen label="Initializing VeerWell command grid & PostgreSQL session…" />;
  }

  // ── Authentication Gate: Unauthenticated users see the Supabase Auth login screen ──
  if (!isAuthenticated && !demoBypass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-navy-950 text-slate-100 relative overflow-hidden">
        <div className="fixed inset-0 bg-tactical-grid opacity-30 pointer-events-none z-0" />
        <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-accent-gold/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-0 -left-40 w-[600px] h-[600px] bg-olive-500/15 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-lg space-y-6">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" />
          </div>

          <SupabaseAuth onSuccess={() => setDemoBypass(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-accent-gold selection:text-navy-950 relative overflow-x-hidden">
      <div className="fixed inset-0 bg-tactical-grid opacity-30 pointer-events-none z-0" />
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 -left-40 w-[500px] h-[500px] bg-olive-500/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {tabLoading ? (
            <BrandedLoader label="Loading module with VeerWell identity lock…" />
          ) : (
            <ProtectedRoute tabId={activeTab} onNavigate={handleTabChange}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {activeTab === 'home' && <HomeOverviewTab onNavigate={handleTabChange} />}
                  {activeTab === 'dashboard' && role !== 'commander' && <DashboardTab onNavigate={handleTabChange} />}
                  {activeTab === 'commander-dashboard' && role === 'commander' && <CommanderDashboardTab onNavigate={handleTabChange} />}
                  {activeTab === 'clinical-dashboard' && role === 'welfare_officer' && <ClinicalDashboardTab />}
                  {activeTab === 'assessment' && <SelfAssessmentTab />}
                  {activeTab === 'analytics' && <PredictiveAnalyticsTab />}
                  {activeTab === 'interventions' && <InterventionsTab />}
                  {activeTab === 'privacy' && <PrivacySecurityTab />}
                  {activeTab === 'datasets' && <DatasetsSimulationTab />}
                  {activeTab === 'impact' && <ImpactBenefitsTab />}
                  {activeTab === 'about' && <HackathonAboutTab />}
                  {activeTab === 'integrations' && <IntegrationsTab />}
                  {activeTab === 'supabase-data' && <SupabaseDataTab />}
                  {activeTab === 'feedback' && <FeedbackTab />}
                  {activeTab === 'deployment-logistics' && role === 'commander' && <DeploymentLogisticsTab />}
                  {activeTab === 'algorithm-telemetry' && role === 'analyst' && <AlgorithmTelemetryTab />}
                  {activeTab === 'voice-assistant' && role === 'personnel' && <VoiceAssistantTab />}
                  {activeTab === 'peer-support' && role === 'personnel' && <PeerSupportTab />}
                </motion.div>
              </AnimatePresence>
            </ProtectedRoute>
          )}
        </main>
      </div>

      <Footer onNavigate={handleTabChange} />
      <AiWelfareCopilot />
      <AuthModal />

      {/* Supabase Connection Status Toast */}
      {showStatus && supabaseStatus !== 'loading' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-20 lg:bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl text-sm font-mono flex items-center gap-3 max-w-sm ${
            supabaseStatus === 'connected'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          <span className="text-lg">{supabaseStatus === 'connected' ? '✅' : '❌'}</span>
          <span className="flex-1 leading-tight">{supabaseMessage}</span>
          <button
            onClick={() => setShowStatus(false)}
            className="ml-2 text-white/50 hover:text-white transition-colors text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Dynamic Mobile Bottom Bar Filtered by RBAC Persona */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-olive-950/95 border-t border-olive-700/60 px-2 py-2 flex items-center justify-around backdrop-blur-xl">
        {getVisibleTabsForRole(role).slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition-all ${
                isActive ? 'text-accent-gold font-bold' : 'text-olive-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[8px] truncate">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainPlatform />
    </AuthProvider>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TABS } from './components/layout/Sidebar';
import { HomeTab } from './components/tabs/HomeTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { AssessmentsTab } from './components/tabs/AssessmentsTab';
import { PredictiveAnalyticsTab } from './components/tabs/PredictiveAnalyticsTab';
import { InterventionTab } from './components/tabs/InterventionTab';
import { DeploymentTab } from './components/tabs/DeploymentTab';
import { LeaveHistoryTab } from './components/tabs/LeaveHistoryTab';
import { WellnessSurveyTab } from './components/tabs/WellnessSurveyTab';
import { WorkloadTab } from './components/tabs/WorkloadTab';
import { WearablesTab } from './components/tabs/WearablesTab';
import { PrivacySecurityTab } from './components/tabs/PrivacySecurityTab';
import { DatasetsTab } from './components/tabs/DatasetsTab';
import { ImpactTab } from './components/tabs/ImpactTab';
import { AboutTab } from './components/tabs/AboutTab';
import { NotificationsTab } from './components/tabs/NotificationsTab';
import { IntegrationTab } from './components/tabs/IntegrationTab';
import { FeedbackTab } from './components/tabs/FeedbackTab';

const MainPlatform: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-olive-white text-olive-700 gap-3">
        <div className="w-12 h-12 border-3 border-olive-500/20 border-t-olive-700 rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-600">Loading VeerWell Intelligence Platform...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal onSuccess={() => setActiveTab('dashboard')} />;
  }

  // Ensure current active tab is permitted for current role
  const currentTabObj = TABS.find((t) => t.id === activeTab);
  const isTabAllowed = currentTabObj ? currentTabObj.roles.includes(role) : true;
  const effectiveTab = isTabAllowed ? activeTab : 'home';

  return (
    <div className="min-h-screen bg-gradient-vertical-olive text-slate-900 flex flex-col antialiased selection:bg-olive-600 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Lights */}
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-olive-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 -left-40 w-[500px] h-[500px] bg-olive-700/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Global Navbar */}
      <Navbar activeTab={effectiveTab} onTabChange={setActiveTab} />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar activeTab={effectiveTab} onTabChange={setActiveTab} />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {effectiveTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
              {effectiveTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
              {effectiveTab === 'assessments' && <AssessmentsTab />}
              {effectiveTab === 'predictive' && <PredictiveAnalyticsTab />}
              {effectiveTab === 'stress' && <InterventionTab />}
              {effectiveTab === 'deployment' && <DeploymentTab />}
              {effectiveTab === 'leave' && <LeaveHistoryTab />}
              {effectiveTab === 'surveys' && <WellnessSurveyTab />}
              {effectiveTab === 'workload' && <WorkloadTab />}
              {effectiveTab === 'wearables' && <WearablesTab />}
              {effectiveTab === 'privacy' && <PrivacySecurityTab />}
              {effectiveTab === 'datasets' && <DatasetsTab />}
              {effectiveTab === 'impact' && <ImpactTab />}
              {effectiveTab === 'about' && <AboutTab />}
              {effectiveTab === 'notifications' && <NotificationsTab />}
              {effectiveTab === 'integration' && <IntegrationTab />}
              {effectiveTab === 'feedback' && <FeedbackTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for smaller viewports */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-t border-olive-200 px-2 py-2 flex items-center justify-around">
        {TABS.filter((t) => t.roles.includes(role))
          .slice(0, 5)
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                  isActive ? 'text-olive-700 font-bold' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] truncate">{tab.label.split(' ')[0]}</span>
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

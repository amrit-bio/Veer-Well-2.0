import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TABS } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AiWelfareCopilot } from './components/common/AiWelfareCopilot';
import { AuthModal } from './components/auth/AuthModal';
import { BrandedLoader } from './components/common/BrandedLoader';
import { HomeOverviewTab } from './components/tabs/HomeOverviewTab';

import { DashboardTab } from './components/tabs/DashboardTab';
import { SelfAssessmentTab } from './components/tabs/SelfAssessmentTab';
import { PredictiveAnalyticsTab } from './components/tabs/PredictiveAnalyticsTab';
import { InterventionsTab } from './components/tabs/InterventionsTab';
import { PrivacySecurityTab } from './components/tabs/PrivacySecurityTab';
import { DatasetsSimulationTab } from './components/tabs/DatasetsSimulationTab';
import { ImpactBenefitsTab } from './components/tabs/ImpactBenefitsTab';
import { HackathonAboutTab } from './components/tabs/HackathonAboutTab';
import { IntegrationsTab } from './components/tabs/IntegrationsTab';
import { FeedbackTab } from './components/tabs/FeedbackTab';

const MainPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [bootLoading, setBootLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setBootLoading(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setTabLoading(true);
    setActiveTab(tabId);
    window.setTimeout(() => setTabLoading(false), 420);
  };

  if (bootLoading) {
    return <BrandedLoader fullscreen label="Initializing VeerWell command grid & XGBoost welfare engine…" />;
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
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {activeTab === 'home' && <HomeOverviewTab onNavigate={handleTabChange} />}
                {activeTab === 'dashboard' && <DashboardTab onNavigate={handleTabChange} />}
                {activeTab === 'assessment' && <SelfAssessmentTab />}
                {activeTab === 'analytics' && <PredictiveAnalyticsTab />}
                {activeTab === 'interventions' && <InterventionsTab />}
                {activeTab === 'privacy' && <PrivacySecurityTab />}
                {activeTab === 'datasets' && <DatasetsSimulationTab />}
                {activeTab === 'impact' && <ImpactBenefitsTab />}
                {activeTab === 'about' && <HackathonAboutTab />}
                {activeTab === 'integrations' && <IntegrationsTab />}
                {activeTab === 'feedback' && <FeedbackTab />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <Footer onNavigate={handleTabChange} />
      <AiWelfareCopilot />
      <AuthModal />

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-olive-950/95 border-t border-olive-700/60 px-2 py-2 flex items-center justify-around backdrop-blur-xl">
        {TABS.slice(0, 5).map((tab) => {
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

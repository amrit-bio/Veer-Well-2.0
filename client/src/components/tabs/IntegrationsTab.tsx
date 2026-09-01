import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { BrandLogo } from '../common/BrandLogo';
import { BrandedLoader } from '../common/BrandedLoader';
import {
  Cpu,
  Radio,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Server,
  Activity,
  HeartPulse,
  Shield,
  Watch,
} from 'lucide-react';

export const IntegrationsTab: React.FC = () => {
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [integrations, setIntegrations] = useState([
    {
      id: 'hrms',
      name: 'Central Armed Forces HRMS',
      type: 'Government Enterprise Portal',
      status: 'Connected',
      lastSync: '5 mins ago',
      details: 'Syncing battalion deployment rosters, leave requests, and duty shift allocations.',
    },
    {
      id: 'garmin',
      name: 'Garmin Instinct Tactical / Tactix 7',
      type: 'Military Smartwatch API',
      status: 'Connected',
      lastSync: 'Real-Time (BLE)',
      details: 'Streaming continuous optical heart rate, SpO2, stress score, and VO2 max.',
    },
    {
      id: 'polar',
      name: 'Polar H10 & Chest Bio-Harness',
      type: 'ECG Sensor',
      status: 'Connected',
      lastSync: 'Real-Time (BLE)',
      details: 'High-precision millisecond-grade RR intervals for clinical HRV (RMSSD / SDNN) metrics.',
    },
    {
      id: 'mesh',
      name: 'Tactical Border LoRa Mesh Gateway',
      type: 'Offline Sentry Telemetry',
      status: 'Standby / Edge Ready',
      lastSync: '1 hour ago',
      details: 'Forward outpost packet relayer for zero-connectivity high-altitude sectors.',
    },
  ]);

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIntegrations((prev) => prev.map((item) => ({ ...item, lastSync: 'Just now', status: 'Connected' })));
      setIsSyncingAll(false);
    }, 1200);
  };

  const handleToggle = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Connected' ? 'Standby' : 'Connected',
              lastSync: item.status === 'Connected' ? 'Paused' : 'Just now',
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-olive-400/30">
        <div className="flex items-start gap-3">
          <BrandLogo size="md" />
          <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40">
              Hardware & Enterprise Interoperability
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            HRMS & Tactical Wearable Integrations
          </h1>
          <p className="text-xs text-olive-200 mt-1 max-w-xl">
            Unified API gateway connecting Central Armed Forces HRMS, tactical BLE biometrics, and field mesh sensors.
          </p>
          </div>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="px-4 py-2.5 rounded-xl bg-accent-gold hover:bg-yellow-400 text-navy-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
          <span>{isSyncingAll ? 'Synchronizing Nodes...' : 'Synchronize All Nodes'}</span>
        </button>
      </div>

      {/* Grid: 3D BioRing & Integration Cards */}
      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isSyncingAll ? (
          <BrandedLoader compact label="Synchronizing HRMS & BLE nodes…" />
        ) : (
          integrations.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              className="glass-panel p-5 rounded-2xl border border-olive-400/25 flex flex-col justify-between space-y-2 hover:border-accent-gold/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-olive-900 border border-olive-700 text-accent-gold flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-white">{item.name}</h3>
                    <span className="text-[10px] text-olive-300 font-mono">{item.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                      item.status === 'Connected'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-olive-800 text-olive-300 border-olive-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </button>
                </div>
              </div>

              <p className="text-xs text-olive-200 leading-relaxed pt-1">{item.details}</p>

              <div className="flex items-center justify-between pt-2 border-t border-olive-800 text-[10px] font-mono text-olive-400">
                <span>Last Sync: {item.lastSync}</span>
                <span className="text-accent-gold">Protocol: mTLS 1.3</span>
              </div>
            </motion.div>
            ))
          )}
      </div>
    </div>
  );
};

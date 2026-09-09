import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Shield, Heart, Phone, Mail, Lock } from 'lucide-react';

export const PeerSupportTab: React.FC = () => {
  const resources = [
    { id: 1, title: 'Confidential Counseling', icon: MessageCircle, description: 'Anonymous 1-on-1 sessions with Unit Welfare Officer', available: true },
    { id: 2, title: 'Peer Support Network', icon: Users, description: 'Connect with trained peer supporters in your unit', available: true },
    { id: 3, title: 'Crisis Helpline', icon: Phone, description: '24/7 toll-free mental health support line', available: true },
    { id: 4, title: 'Wellness Library', icon: Heart, description: 'Articles, guides, and self-help resources', available: true },
  ];

  const upcomingSessions = [
    { id: 1, type: 'Group De-Brief', date: 'Today, 1400 hrs', facilitator: 'Maj. Sharma (Psychologist)', location: 'Unit Community Hall' },
    { id: 2, type: 'Box Breathing Workshop', date: 'Tomorrow, 0630 hrs', facilitator: 'WO Kumar', location: 'Squadron Grounds' },
    { id: 3, type: 'Art Therapy Session', date: 'Fri, 1600 hrs', facilitator: 'Ms. Priya (Counselor)', location: 'Welfare Center' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-500/40 shadow-lg">
          <Users className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Peer Support & Resources</h2>
          <p className="text-xs text-olive-300 font-mono">Privacy-preserving wellness modules & anonymous counseling channels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl bg-olive-900/50 border border-olive-700/50 hover:border-emerald-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <resource.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">{resource.title}</h3>
                  {resource.available && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                      AVAILABLE
                    </span>
                  )}
                </div>
                <p className="text-xs text-olive-300 leading-relaxed">{resource.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-olive-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-olive-800 bg-olive-900/50">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-gold" />
            Upcoming Support Sessions
          </h3>
        </div>
        <div className="divide-y divide-olive-800">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="px-4 py-3 flex items-center justify-between hover:bg-olive-900/30 transition-colors">
              <div>
                <div className="text-sm font-bold text-white">{session.type}</div>
                <div className="text-[10px] text-olive-400 font-mono">{session.facilitator} • {session.location}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-accent-gold">{session.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-olive-950/80 border border-emerald-500/30 p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Confidentiality Guarantee</h3>
            <p className="text-xs text-olive-300 leading-relaxed">
              All peer support interactions are strictly confidential under the Armed Forces Welfare Doctrine.
              Your identity and participation are never disclosed to commanding officers or used for appraisals.
              Data is protected with end-to-end encryption and zero-knowledge architecture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

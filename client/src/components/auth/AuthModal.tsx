import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { SupabaseAuth } from './SupabaseAuth';
import { X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, session } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md rounded-3xl glass-panel border border-accent-gold/40 shadow-2xl bg-olive-950/95 overflow-hidden text-slate-100"
        >
          {/* Header Banner */}
          <div className="p-5 md:p-6 border-b border-olive-800/80 bg-gradient-to-r from-olive-900 via-olive-950 to-olive-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                  VeerWell Authentication
                </h2>
                <p className="text-xs text-olive-300 font-mono">
                  Sign in to your account
                </p>
              </div>
            </div>

            <button
              onClick={closeAuthModal}
              className="p-2 rounded-xl text-olive-400 hover:text-white hover:bg-olive-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Auth Content */}
          <div className="p-5 md:p-6">
            <SupabaseAuth onSuccess={closeAuthModal} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

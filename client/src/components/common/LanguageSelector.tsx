import React, { useState, useRef, useEffect } from 'react';
import { Languages, Globe, Check, Search, Sparkles, Loader2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_INDIAN_LANGUAGES, LanguageOption } from '../../services/translationService';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { currentLanguage, currentLanguageObj, setLanguage, isTranslating, translationStatus } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_INDIAN_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'pa', 'gu'];

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs shadow-sm ${
          currentLanguage !== 'en'
            ? 'bg-accent-gold/15 border-accent-gold/50 text-accent-gold hover:bg-accent-gold/25'
            : 'bg-olive-900/90 border-olive-600/40 text-slate-200 hover:border-olive-400 hover:bg-olive-800'
        }`}
        title="Select Indian Language (All 22 Official Languages Supported via AI API)"
      >
        {isTranslating ? (
          <Loader2 className="w-3.5 h-3.5 text-accent-gold animate-spin" />
        ) : (
          <Globe className="w-3.5 h-3.5 text-accent-gold" />
        )}

        <div className="text-left flex items-center gap-1.5 font-medium">
          <span className="font-bold text-white text-[11px]">
            {currentLanguageObj.nativeName}
          </span>
          {!compact && (
            <span className="text-[10px] text-olive-300 hidden sm:inline">
              ({currentLanguageObj.name})
            </span>
          )}
        </div>

        <span className="text-[9px] px-1.5 py-0.2 rounded bg-olive-950/80 text-accent-gold font-mono uppercase font-bold border border-olive-700/50">
          {currentLanguage}
        </span>
      </button>

      {/* Dropdown Modal Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-3 shadow-2xl z-50 border border-olive-500/40 bg-olive-950 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-olive-800">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-accent-gold" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Indian Languages (22 Official)
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-olive-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Language Pills */}
          <div className="pt-2 pb-1 px-1">
            <div className="text-[10px] font-mono text-olive-400 mb-1.5 uppercase font-semibold">
              Popular Quick Select:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topLanguages.map((code) => {
                const l = SUPPORTED_INDIAN_LANGUAGES.find((item) => item.code === code);
                if (!l) return null;
                const isSelected = currentLanguage === code;
                return (
                  <button
                    key={code}
                    onClick={() => handleSelectLanguage(code)}
                    className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-accent-gold text-navy-950 font-bold shadow-md'
                        : 'bg-olive-900/80 border border-olive-700/60 text-slate-200 hover:bg-olive-800 hover:text-white'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[9px] opacity-70">({l.code})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="my-2 relative px-1">
            <Search className="w-3.5 h-3.5 text-olive-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by language, script, state (e.g. Tamil, Punjabi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-olive-900/80 border border-olive-700 text-xs text-slate-100 placeholder-olive-400 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
              autoFocus
            />
          </div>

          {/* Scrollable Language List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-64 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-6 text-xs text-olive-400">
                No matching Indian language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-accent-gold/20 border-accent-gold/60 text-white shadow-sm'
                        : 'bg-olive-900/40 border-transparent hover:bg-olive-900 hover:border-olive-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-olive-950 border border-olive-700 flex items-center justify-center text-[10px] font-mono font-bold text-accent-gold">
                        {lang.code.toUpperCase()}
                      </span>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span className="text-white text-sm">{lang.nativeName}</span>
                          <span className="text-[11px] text-olive-300 font-normal">
                            ({lang.name})
                          </span>
                        </div>
                        <div className="text-[9px] text-olive-400 font-mono">
                          {lang.region} • {lang.script}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent-gold text-navy-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-2 pt-2 border-t border-olive-800/80 px-1 flex items-center justify-between text-[10px] text-olive-400 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent-gold" />
              <span>AI Translation API Powered</span>
            </span>
            <span className="text-accent-gold font-bold">22 Constitutional Languages</span>
          </div>
        </div>
      )}
    </div>
  );
};

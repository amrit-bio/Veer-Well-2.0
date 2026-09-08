import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  SUPPORTED_INDIAN_LANGUAGES,
  LanguageOption,
  translateText,
  translateBatch,
} from '../services/translationService';

interface LanguageContextType {
  currentLanguage: string;
  currentLanguageObj: LanguageOption;
  setLanguage: (langCode: string) => Promise<void>;
  isTranslating: boolean;
  translationStatus: string;
  t: (text: string, fallback?: string) => string;
  translateAsync: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// WeakMap to preserve the original English text for each DOM text node
const originalTextMap = new WeakMap<Node, string>();

// Elements to ignore during automated DOM translation
const IGNORE_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
  'INPUT',
  'CODE',
  'PRE',
  'NOSCRIPT',
  'SVG',
  'CANVAS',
]);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('veerwell_language') || 'en';
    }
    return 'en';
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationStatus, setTranslationStatus] = useState<string>('');
  const activeLangRef = useRef<string>(currentLanguage);
  activeLangRef.current = currentLanguage;

  const currentLanguageObj =
    SUPPORTED_INDIAN_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_INDIAN_LANGUAGES[0];

  // Synchronous t() helper using storage/memory cache
  const t = useCallback(
    (text: string, fallback?: string): string => {
      if (currentLanguage === 'en' || !text) return fallback || text;
      try {
        const raw = localStorage.getItem(`veerwell_trans_${currentLanguage}`);
        if (raw) {
          const dict = JSON.parse(raw);
          if (dict[text.trim()]) return dict[text.trim()];
        }
      } catch {}
      return fallback || text;
    },
    [currentLanguage]
  );

  const translateAsync = useCallback(
    async (text: string): Promise<string> => {
      if (currentLanguage === 'en' || !text) return text;
      return await translateText(text, currentLanguage);
    },
    [currentLanguage]
  );

  /**
   * Translates text nodes within a given container
   */
  const translateDOM = useCallback(async (rootNode: Node, targetLang: string) => {
    if (targetLang === 'en') {
      // Revert all modified nodes back to original English
      const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null);
      let currentNode = walker.nextNode();
      while (currentNode) {
        if (originalTextMap.has(currentNode)) {
          const orig = originalTextMap.get(currentNode);
          if (orig && currentNode.nodeValue !== orig) {
            currentNode.nodeValue = orig;
          }
        }
        currentNode = walker.nextNode();
      }
      return;
    }

    // Collect all valid text nodes
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (IGNORE_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.no-translate') || parent.getAttribute('contenteditable') === 'true') {
          return NodeFilter.FILTER_REJECT;
        }
        const val = node.nodeValue?.trim();
        if (!val || val.length === 0 || /^[\d\s\-_.,!?:;%()/[\]{}@#$^*+=~`|<>'"\\]+$/.test(val)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodesToTranslate: Node[] = [];
    const textsToTranslate: string[] = [];

    let node = walker.nextNode();
    while (node) {
      // If we don't have the original text stored yet, save it now
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.nodeValue || '');
      }

      const originalText = originalTextMap.get(node) || node.nodeValue || '';
      const trimmed = originalText.trim();

      if (trimmed.length > 0) {
        nodesToTranslate.push(node);
        textsToTranslate.push(trimmed);
      }

      node = walker.nextNode();
    }

    if (nodesToTranslate.length === 0) return;

    try {
      // Batch translate through the API / caching system
      const translatedBatch = await translateBatch(textsToTranslate, targetLang);

      if (activeLangRef.current !== targetLang) return; // Discard if user changed language in the meantime

      for (let i = 0; i < nodesToTranslate.length; i++) {
        const targetNode = nodesToTranslate[i];
        const original = originalTextMap.get(targetNode) || '';
        const translated = translatedBatch[i];

        if (translated && original) {
          // Preserve surrounding whitespace
          const leadingSpace = original.match(/^\s*/)?.[0] || '';
          const trailingSpace = original.match(/\s*$/)?.[0] || '';
          targetNode.nodeValue = `${leadingSpace}${translated}${trailingSpace}`;
        }
      }
    } catch (err) {
      console.error('[LanguageContext] DOM translation batch failed:', err);
    }
  }, []);

  /**
   * Trigger whole-page translation
   */
  const triggerPageTranslation = useCallback(
    async (lang: string) => {
      if (typeof document === 'undefined') return;
      if (lang === 'en') {
        setIsTranslating(false);
        setTranslationStatus('');
        await translateDOM(document.body, 'en');
        return;
      }

      const langInfo = SUPPORTED_INDIAN_LANGUAGES.find((l) => l.code === lang);
      const name = langInfo ? `${langInfo.nativeName} (${langInfo.name})` : lang;

      setIsTranslating(true);
      setTranslationStatus(`Translating to ${name} via AI API…`);

      try {
        await translateDOM(document.body, lang);
        setTranslationStatus(`Translated to ${name}`);
        setTimeout(() => setTranslationStatus(''), 2500);
      } catch (err: any) {
        setTranslationStatus('Translation partially completed');
        setTimeout(() => setTranslationStatus(''), 3000);
      } finally {
        setIsTranslating(false);
      }
    },
    [translateDOM]
  );

  /**
   * Change Language handler
   */
  const setLanguage = async (langCode: string) => {
    setCurrentLanguageState(langCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('veerwell_language', langCode);
    }
    await triggerPageTranslation(langCode);
  };

  // Run on mount and language changes
  useEffect(() => {
    if (currentLanguage !== 'en') {
      const timer = setTimeout(() => {
        triggerPageTranslation(currentLanguage);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLanguage, triggerPageTranslation]);

  // MutationObserver to automatically translate newly added DOM nodes in real time
  useEffect(() => {
    if (currentLanguage === 'en' || typeof document === 'undefined') return;

    let debounceTimer: any = null;
    const pendingNodes = new Set<Node>();

    const observer = new MutationObserver((mutations) => {
      if (activeLangRef.current === 'en') return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              pendingNodes.add(node);
            }
          });
        }
      }

      if (pendingNodes.size > 0) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (activeLangRef.current === 'en') return;
          pendingNodes.forEach((node) => {
            if (document.body.contains(node)) {
              translateDOM(node, activeLangRef.current);
            }
          });
          pendingNodes.clear();
        }, 200);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    });

    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
    };
  }, [currentLanguage, translateDOM]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLanguageObj,
        setLanguage,
        isTranslating,
        translationStatus,
        t,
        translateAsync,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

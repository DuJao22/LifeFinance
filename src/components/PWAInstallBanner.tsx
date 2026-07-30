import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, X } from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallBannerProps {
  onOpenModalExternal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running as standalone app
    const isApp = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isApp) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('lifefinance_pwa_banner_dismissed');
    if (!dismissed) {
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setShowBanner(false);
          setShowModal(false);
        }
        setDeferredPrompt(null);
      } catch (e) {
        console.error('Install prompt error:', e);
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('lifefinance_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {!isStandalone && showBanner && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border border-blue-500/40 shadow-xl backdrop-blur-md relative text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Instalar Web App LifeFinance</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px]">
                    Versão PWA
                  </span>
                </h4>
                <p className="text-[11px] text-blue-200/90 mt-0.5">
                  Instale na sua tela inicial para acesso instantâneo e melhor experiência sem loja de apps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-800/60 justify-end">
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-xs text-blue-300 hover:text-white font-medium transition-colors"
              >
                Depois
              </button>
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Instalar App</span>
              </button>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 text-blue-300 hover:text-white p-1 rounded-lg"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Interactive Step-by-step PWA Install Modal */}
      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deferredPrompt={deferredPrompt}
        onInstallDirectly={handleInstallClick}
      />
    </>
  );
};

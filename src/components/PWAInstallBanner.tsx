import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, X, CheckCircle2, Share2, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running as standalone app
    const isApp = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isApp) {
      setIsStandalone(true);
      return;
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('lifefinance_pwa_banner_dismissed');
    if (!dismissed) {
      // Show default banner for iOS or browser prompt
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
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('Para instalar no iPhone:\n1. Toque no ícone de Compartilhar (no Safari)\n2. Selecione "Adicionar à Tela de Início" 📲');
    } else {
      alert('Acesse as opções do seu navegador e clique em "Instalar Aplicativo" ou "Adicionar à tela inicial" 📱');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('lifefinance_pwa_banner_dismissed', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
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
                Versão Web
              </span>
            </h4>
            <p className="text-[11px] text-blue-200/90 mt-0.5">
              Instale o app na sua tela inicial para acesso instantâneo e melhor experiência no celular.
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
  );
};

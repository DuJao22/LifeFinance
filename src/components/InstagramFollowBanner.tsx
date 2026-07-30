import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Sparkles, X, Heart, ExternalLink } from 'lucide-react';

export const InstagramFollowBanner: React.FC = () => {
  const [showCard, setShowCard] = useState<boolean>(false);

  useEffect(() => {
    // Show banner if not dismissed in the last 24h
    const dismissedAt = localStorage.getItem('lifefinance_insta_banner_dismissed_at');
    if (!dismissedAt) {
      setShowCard(true);
    } else {
      const now = Date.now();
      const elapsed = now - parseInt(dismissedAt, 10);
      // Show again if 24 hours passed
      if (elapsed > 24 * 60 * 60 * 1000) {
        setShowCard(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowCard(false);
    localStorage.setItem('lifefinance_insta_banner_dismissed_at', Date.now().toString());
  };

  if (!showCard) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/90 via-purple-950/90 to-slate-900/90 border border-pink-500/30 shadow-2xl backdrop-blur-md relative text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                <span>Criado por Layon.dev</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                Desenvolvedor
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Siga no Instagram para receber dicas de finanças, atualizações do app e suporte direto!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-900/50">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            Agora não
          </button>
          <a
            href="https://instagram.com/layon.dev"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 flex items-center gap-1.5 transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>Siga @Layon.dev</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

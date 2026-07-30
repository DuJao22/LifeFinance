import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { LOGO_DATA_URL } from '../assets/logoData';

interface SplashScreenProps {
  onComplete: () => void;
  userName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, userName }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Inicializando ambiente seguro...');

  useEffect(() => {
    const messages = [
      'Inicializando ambiente seguro...',
      'Verificando criptografia militar AES-256...',
      'Carregando contas e balanço financeiro...',
      'Tudo pronto! Bem-vindo ao LifeFinance.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next >= 25 && currentStep === 0) {
          currentStep = 1;
          setStatusMessage(messages[1]);
        } else if (next >= 60 && currentStep === 1) {
          currentStep = 2;
          setStatusMessage(messages[2]);
        } else if (next >= 90 && currentStep === 2) {
          currentStep = 3;
          setStatusMessage(messages[3]);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none font-sans"
      >
        {/* Animated Background Mesh & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0,transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Particles/Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        {/* Central Logo Container */}
        <div className="relative flex flex-col items-center z-10 max-w-sm px-6 text-center">
          {/* Glowing Ring & 3D Logo */}
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 opacity-60 blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden p-1 bg-slate-900 border border-slate-700/80 shadow-2xl flex items-center justify-center"
            >
              <img
                src={LOGO_DATA_URL}
                alt="LifeFinance 3D Logo"
                className="w-full h-full object-cover rounded-2xl shadow-inner"
              />
            </motion.div>

            {/* Shield Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-lg border border-slate-900 flex items-center justify-center"
            >
              <ShieldCheck className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Title & Branding */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-blue-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>LifeFinance App</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
              LifeFinance
            </h1>
            
            <p className="text-xs text-slate-400 font-medium">
              {userName ? `Bem-vindo de volta, ${userName}!` : 'Controle Financeiro de Alto Nível & Criptografia'}
            </p>
          </motion.div>

          {/* Progress Bar & Status Text */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                {statusMessage}
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progress}%</span>
            </div>

            {/* Smooth Progress Track */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Skip button for quick access */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onComplete}
            className="mt-8 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-6 text-[11px] text-slate-500 font-mono tracking-wider">
          PROTEÇÃO AES-256 • CRIPTOGRAFIA DE PONTA A PONTA
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  X,
  Share2,
  Monitor,
  Check,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { LOGO_DATA_URL } from '../assets/logoData';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstallDirectly?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallDirectly
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const isInsideIframe = window.self !== window.top;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md font-sans overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-slate-100 my-auto flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 shadow-md p-0.5 overflow-hidden shrink-0">
                <img src={LOGO_DATA_URL} alt="LifeFinance Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Instalar Aplicativo Web (PWA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instale na sua Tela Inicial como um App Nativo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert if inside preview iframe */}
          {isInsideIframe && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Por que apareceu apenas "Criar atalho"?</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-700 dark:text-slate-300">
                Você está visualizando a plataforma dentro de um <strong>moldura/iframe</strong> do editor. O Chrome impede a instalação direta de PWAs dentro de quadros secundários.
              </p>
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all mt-1"
              >
                <span>1. Clicar para Abrir em Nova Aba</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Direct Native Install Button if browser prompt is ready */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Instalação Automática Pronta!</span>
              </div>
              <p className="text-xs text-blue-100">
                Seu navegador suporta instalação PWA direta com 1 clique.
              </p>
              <button
                onClick={onInstallDirectly}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all mt-1"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Instalar LifeFinance Agora</span>
              </button>
            </div>
          )}

          {/* OS Platform Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              Passo a Passo por Dispositivo:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>iPhone / iOS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'desktop'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Computador</span>
              </button>
            </div>
          </div>

          {/* Instructions Step Content */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
            {activeTab === 'android' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Abra o app em uma <strong className="text-blue-600 dark:text-blue-400">Aba Própria do Chrome</strong> fora da tela de edição.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Toque nos <strong className="text-slate-900 dark:text-white">3 pontinhos (⋮)</strong> no topo do Chrome.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Selecione <strong className="text-blue-600 dark:text-blue-400">"Instalar aplicativo"</strong>.
                  </p>
                </div>
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[11px] text-slate-700 dark:text-slate-300">
                  💡 <em>Caso clique em "Criar atalho", lembre-se de marcar a opção <strong>"Abrir como janela"</strong> para abrir em tela cheia!</em>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Abra o link no <strong className="text-slate-900 dark:text-white">Safari</strong> do iPhone e toque no ícone <strong className="text-blue-600 dark:text-blue-400">Compartilhar 📤</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Selecione <strong className="text-blue-600 dark:text-blue-400">"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Toque em <strong className="text-emerald-600 dark:text-emerald-400">"Adicionar"</strong> no canto superior direito.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    No Chrome/Edge no PC (fora do iframe), procure pelo ícone de <strong className="text-blue-600 dark:text-blue-400">Instalar (⬇️)</strong> do lado da barra de navegação.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Ao criar o atalho, marque a opção <strong className="text-emerald-600 dark:text-emerald-400">"Abrir como janela"</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Benefits Bullet List */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sem ocupar espaço de armazenamento de loja de apps</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Funciona em tela cheia sem barras de navegação do browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Suporte a carregamento ultra-rápido com cache offline</span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Entendido / Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share2,
  MoreVertical,
  Monitor,
  Check,
  Sparkles,
  ExternalLink
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
                  Instalar Aplicativo Web
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acesse o LifeFinance direto da sua Tela Inicial
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

          {/* Direct Native Install Button if browser prompt is ready */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Instalação Automática Pronta!</span>
              </div>
              <p className="text-xs text-blue-100">
                Seu navegador suporta instalação direta com 1 clique.
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
              Selecione seu Dispositivo para Instruções Passo a Passo:
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
                    Toque nos <strong className="text-slate-900 dark:text-white">3 pontinhos (⋮)</strong> no canto superior direito do seu navegador Chrome.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Clique em <strong className="text-blue-600 dark:text-blue-400">"Instalar aplicativo"</strong> ou <strong className="text-blue-600 dark:text-blue-400">"Criar atalho"</strong> / <strong className="text-blue-600 dark:text-blue-400">"Adicionar à Tela Inicial"</strong>.
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 my-1 text-slate-800 dark:text-slate-200">
                  <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Se apareceu "Criar atalho":</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Marque a caixinha <strong className="text-slate-900 dark:text-white">"Abrir como janela"</strong> antes de confirmar! Isso fará o atalho abrir como um <strong className="text-emerald-600 dark:text-emerald-400">Aplicativo Nativo em Tela Cheia</strong>, sem a barra do navegador.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Pronto! O ícone do LifeFinance vai para a tela inicial do seu celular.
                  </p>
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
                    Abra o site no <strong className="text-slate-900 dark:text-white">Safari</strong> do iPhone e toque no botão <strong className="text-blue-600 dark:text-blue-400">Compartilhar 📤</strong> na barra inferior.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Role as opções para baixo e toque em <strong className="text-blue-600 dark:text-blue-400">"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Toque em <strong className="text-emerald-600 dark:text-emerald-400">"Adicionar"</strong> no canto superior direito. Pronto!
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
                    No Chrome/Edge no PC, clique nos <strong className="text-slate-900 dark:text-white">3 pontinhos (⋮)</strong> ou no ícone de <strong className="text-blue-600 dark:text-blue-400">Instalar (⬇️)</strong> na barra de endereço.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Se escolher <strong className="text-blue-600 dark:text-blue-400">"Criar atalho"</strong>, marque a opção <strong className="text-emerald-600 dark:text-emerald-400">"Abrir como janela"</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Open in New Tab Helper Button */}
          {window.self !== window.top && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between gap-2">
              <div className="text-[11px] text-blue-800 dark:text-blue-200">
                <strong>Você está na pré-visualização:</strong> Abra em uma nova aba para liberar a instalação nativa do navegador.
              </div>
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm transition-all"
              >
                <span>Abrir Aba</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Benefits Bullet List */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sem ocupar memória da loja de aplicativos (App Store / Play Store)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Funciona em tela cheia sem barras de navegação do browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Carregamento ultra-rápido com cache offline e suporte a PWA</span>
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

import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, History, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  devoCount: number;
  receberCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  devoCount,
  receberCount
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devo', label: 'Devo', icon: ArrowUpCircle, badge: devoCount, badgeColor: 'bg-rose-500' },
    { id: 'receber', label: 'Receber', icon: ArrowDownCircle, badge: receberCount, badgeColor: 'bg-emerald-500' },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around text-slate-600 dark:text-slate-400">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-blue-50 dark:bg-gradient-to-r dark:from-blue-600/30 dark:to-indigo-600/30 border border-blue-200 dark:border-blue-500/40 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full ${tab.badgeColor} shadow-md`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

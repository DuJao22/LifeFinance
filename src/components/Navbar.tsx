import React from 'react';
import { UserProfile } from '../types';
import { Sun, Moon, Bell, Wallet, LogOut } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  pendingDueCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  pendingDueCount,
  onLogout
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Financeiro';
      case 'devo':
        return 'Pessoas Para Quem Devo';
      case 'receber':
        return 'Pessoas Que Me Devem';
      case 'historico':
        return 'Histórico de Movimentações';
      case 'perfil':
        return 'Meu Perfil & Ajustes';
      default:
        return 'LifeFinance';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & View Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">LifeFinance</span>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 sm:text-base line-clamp-1">
              {getTabTitle()}
            </h1>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Due Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700/50"
            title="Notificações de Vencimento"
          >
            <Bell className="w-5 h-5" />
            {pendingDueCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
                {pendingDueCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700/50 flex items-center gap-1.5"
            title={isDarkMode ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="hidden sm:inline text-xs font-semibold text-amber-300">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-600" />
                <span className="hidden sm:inline text-xs font-semibold text-indigo-700">Escuro</span>
              </>
            )}
          </button>

          {/* User Avatar Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-inner overflow-hidden border border-slate-300 dark:border-slate-700">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <button
              onClick={onLogout}
              className="hidden md:flex p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

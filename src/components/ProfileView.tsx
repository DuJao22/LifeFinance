import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, PersonRecord, MovementHistoryItem } from '../types';
import {
  updateUserProfile,
  changeUserPassword,
  deleteAccount,
  clearUserRecordsAndHistory,
  exportUserBackupJSON,
  importUserBackupJSON
} from '../utils/storage';
import { getEncryptionMetadata } from '../utils/crypto';
import { exportToPDF, exportToExcel } from '../utils/formatters';
import {
  User,
  Mail,
  Lock,
  Sun,
  Moon,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  Bell,
  Trash2,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Camera,
  ShieldCheck,
  Key,
  RotateCcw,
  AlertTriangle,
  Instagram,
  Smartphone,
  ExternalLink,
  Database
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  records: PersonRecord[];
  history: MovementHistoryItem[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onLogout: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info', title?: string) => void;
  onRefreshData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  records,
  history,
  isDarkMode,
  onToggleTheme,
  onUserUpdated,
  onLogout,
  showToast,
  onRefreshData
}) => {
  const [name, setName] = useState(user.name);
  const [photo, setPhoto] = useState(user.photo || '');
  const [notifications, setNotifications] = useState(user.enableNotifications ?? true);

  // Password fields
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Reset & Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  const debts = records.filter(r => r.type === 'DEVO');
  const receivables = records.filter(r => r.type === 'RECEBER');
  const encMeta = getEncryptionMetadata();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile(user.id, {
        name: name.trim(),
        photo: photo.trim(),
        enableNotifications: notifications
      });
      onUserUpdated(updated);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      showToast(msg, 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('As senhas não coincidem.', 'error');
      return;
    }

    try {
      await changeUserPassword(user.id, oldPassword, newPassword);
      showToast('Senha alterada com sucesso!', 'success');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar senha';
      showToast(msg, 'error');
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportUserBackupJSON(user.id, user.email);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeFinance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON criptografado exportado com sucesso!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importUserBackupJSON(user.id, content);
        showToast(`Backup restaurado: ${res.recordsCount} registros carregados no banco!`, 'success');
        onRefreshData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Arquivo de backup inválido.';
        showToast(msg, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    if (resetConfirmInput.trim().toUpperCase() !== 'ZERAR') {
      showToast('Digite a palavra ZERAR para confirmar a limpeza dos dados.', 'error');
      return;
    }

    clearUserRecordsAndHistory(user.id);
    setShowResetModal(false);
    setResetConfirmInput('');
    showToast('Todos os seus lançamentos e histórico foram zerados.', 'info');
    onRefreshData();
  };

  const handleDeleteAccount = () => {
    deleteAccount(user.id);
    showToast('Sua conta foi excluída permanentemente.', 'info');
    onLogout();
  };

  return (
    <div className="space-y-6 pb-24 font-sans max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-6 text-slate-100">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white overflow-hidden shadow-xl border-2 border-blue-500/40">
            {photo ? (
              <img src={photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2 text-[10px] text-slate-400">
            <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700">
              Conta criada em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Criptografia Ativa
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">Informações Pessoais</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">URL da Foto de Perfil</label>
            <div className="relative">
              <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="https://exemplo.com/foto.jpg"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications & Theme Toggles */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Notificações de Vencimento</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="text-xs font-semibold text-slate-200">Tema {isDarkMode ? 'Escuro' : 'Claro'}</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
            >
              Alternar
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
          >
            Alterar Senha
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg"
          >
            Salvar Alterações
          </button>
        </div>
      </form>

      {/* Security & Encryption Status Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Banco de Dados Protegido e Criptografado</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  100% Seguro
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Proteção de ponta a ponta com criptografia AES-256-GCM & PBKDF2</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Seu banco de dados é automaticamente verificado, estruturado e protegido com criptografia militar pelo servidor na inicialização. Seus dados financeiros e de login permanecem estritamente confidenciais e protegidos contra acessos não autorizados.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 block">ALGORITMO</span>
            <span className="text-emerald-400 font-bold">{encMeta.engine}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 block">CHAVE MASTER</span>
            <span className="text-blue-400 font-bold">{encMeta.algorithm}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 block">TAMANHO DA CHAVE</span>
            <span className="text-amber-300 font-bold">{encMeta.bitLength} Bits</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 block">STATUS</span>
            <span className="text-emerald-400 font-bold">🔒 Criptografado</span>
          </div>
        </div>
      </div>

      {/* Reports, Backup, Restore & Zerar Dados Section */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Relatórios, Backup & Gestão de Dados</span>
          <span className="text-[11px] font-normal text-slate-400">
            Total de Lançamentos: <strong className="text-white">{records.length}</strong>
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export PDF */}
          <button
            onClick={() => exportToPDF(user.name, debts, receivables, history)}
            className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-3 transition-all text-left"
          >
            <FileText className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-xs">Exportar Relatório PDF</p>
              <p className="text-[10px] text-rose-300/80">Gera documento completo formatado</p>
            </div>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportToExcel(user.name, debts, receivables, history)}
            className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 transition-all text-left"
          >
            <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-xs">Exportar Planilha Excel (.xlsx)</p>
              <p className="text-[10px] text-emerald-300/80">Planilha com abas de resumo e histórico</p>
            </div>
          </button>

          {/* Export Backup JSON */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center gap-3 transition-all text-left"
          >
            <Download className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-xs">Fazer Backup em JSON</p>
              <p className="text-[10px] text-blue-300/80">Baixar cópia de segurança dos dados</p>
            </div>
          </button>

          {/* Import Backup JSON/SQL (Restaurar Dados) */}
          <label className="p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center gap-3 cursor-pointer transition-all">
            <Upload className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <p className="font-bold text-xs">Restaurar Dados de Backup</p>
              <p className="text-[10px] text-indigo-300/80">Carregar arquivo de backup (.json / .sql)</p>
            </div>
            <input
              type="file"
              accept=".json,.sql"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {/* Zerar Dados Button */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>Zerar Dados Financeiros da Sua Conta</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Limpa os registros e histórico exclusivos da conta <strong className="text-slate-200">{user.email}</strong>, sem afetar seu login.
            </p>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zerar Todos os Meus Dados</span>
          </button>
        </div>
      </div>

      {/* Creator Credits & Web App Install Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Layon.dev Instagram Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-950/40 via-purple-950/40 to-slate-900/90 border border-pink-500/30 shadow-xl backdrop-blur-md space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1">
                <span>Criador: Layon.dev</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">Siga no Instagram para suporte e novidades</p>
            </div>
          </div>
          <a
            href="https://instagram.com/layon.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Siga @Layon.dev no Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* Web App Installation Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/40 via-indigo-950/40 to-slate-900/90 border border-blue-500/30 shadow-xl backdrop-blur-md space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white">Aplicativo Web (PWA)</h3>
              <p className="text-[11px] text-slate-400">Instale na tela inicial do celular como app</p>
            </div>
          </div>
          <button
            onClick={() => {
              showToast('Para instalar: toque no menu do navegador e escolha "Adicionar à Tela Inicial" 📲', 'info');
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Como Instalar o Aplicativo</span>
          </button>
        </div>
      </div>

      {/* Account Danger Zone */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-rose-400 border-b border-rose-900/40 pb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Zona de Perigo</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-200">Sair da Conta ou Excluir</p>
            <p className="text-[11px] text-slate-400">Você pode se desconectar ou apagar seus dados permanentemente.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Conta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-slate-100"
            >
              <h3 className="text-base font-bold mb-4">Alterar Senha de Acesso</h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                  >
                    Alterar Senha
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset / Zerar Dados Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-amber-400">Zerar Todos os Dados Financeiros?</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Esta ação irá apagar <strong>{records.length} registros</strong> de dívidas e recebíveis e <strong>{history.length} movimentações</strong> da sua conta.
                </p>
                <p className="text-[11px] text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  Sua conta continuará ativa, mas todo o histórico financeiro será resetado para o estado limpo.
                </p>
              </div>

              <div className="text-left space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">
                  Digite <span className="text-amber-400 font-extrabold">ZERAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  placeholder="ZERAR"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetConfirmInput('');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleResetAllData}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Zerar Dados</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-rose-900/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-slate-100 text-center"
            >
              <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-rose-400">Excluir Conta Permanentemente?</h3>
              <p className="text-xs text-slate-400 mt-2 mb-6">
                Atenção: Esta ação é irreversível. Todos os seus registros, dívidas e histórico de movimentações serão apagados.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
                >
                  Excluir Definitivamente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { UserProfile, PersonRecord, MovementHistoryItem, RecordType } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getRecords,
  getHistory,
  addOrUpdateRecord,
  registerPartialPayment,
  deletePersonRecord
} from './utils/storage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { PersonList } from './components/PersonList';
import { PersonModal } from './components/PersonModal';
import { PaymentModal } from './components/PaymentModal';
import { HistoryList } from './components/HistoryList';
import { ProfileView } from './components/ProfileView';
import { PersonDetailModal } from './components/PersonDetailModal';
import { daysUntilDue } from './utils/formatters';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Data states
  const [records, setRecords] = useState<PersonRecord[]>([]);
  const [history, setHistory] = useState<MovementHistoryItem[]>([]);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal States
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personModalType, setPersonModalType] = useState<RecordType>('RECEBER');
  const [editingRecord, setEditingRecord] = useState<PersonRecord | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PersonRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<PersonRecord | null>(null);

  // Initialize & load session
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
      loadUserData(user.id);
    }

    // Apply dark class to document HTML
    document.documentElement.classList.add('dark');
  }, []);

  const loadUserData = (userId: string) => {
    const recs = getRecords(userId);
    const hist = getHistory(userId);
    setRecords(recs);
    setHistory(hist);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUserState(user);
    loadUserData(user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setRecords([]);
    setHistory([]);
    showToast('Sessão encerrada.', 'info');
  };

  // Person Modal Handlers
  const handleOpenAdd = (type: RecordType) => {
    setPersonModalType(type);
    setEditingRecord(null);
    setIsPersonModalOpen(true);
  };

  const handleOpenEdit = (record: PersonRecord) => {
    setPersonModalType(record.type);
    setEditingRecord(record);
    setIsPersonModalOpen(true);
  };

  const handleSavePerson = (data: Partial<PersonRecord>) => {
    if (!currentUser) return;
    try {
      addOrUpdateRecord(currentUser.id, data);
      loadUserData(currentUser.id);
      showToast(
        data.id ? 'Lançamento atualizado com sucesso!' : 'Novo lançamento cadastrado com sucesso!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar registro.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!currentUser) return;
    deletePersonRecord(currentUser.id, recordId);
    loadUserData(currentUser.id);
    showToast('Registro excluído com sucesso.', 'info');
  };

  // Payment Modal Handlers
  const handleOpenPayment = (record: PersonRecord) => {
    setPaymentRecord(record);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (
    recordId: string,
    amount: number,
    date: string,
    notes?: string
  ) => {
    if (!currentUser) return;
    try {
      const updated = registerPartialPayment(currentUser.id, recordId, amount, date, notes);
      loadUserData(currentUser.id);

      const isQuitado = updated.status === 'QUITADO';
      showToast(
        isQuitado
          ? '🎉 Lançamento totalmente quitado!'
          : 'Pagamento/Recebimento parcial registrado com sucesso!',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar pagamento.';
      showToast(msg, 'error');
    }
  };

  const handleOpenDetail = (record: PersonRecord) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  // Pending counts for badges
  const devoCount = records.filter(r => r.type === 'DEVO' && r.status !== 'QUITADO').length;
  const receberCount = records.filter(r => r.type === 'RECEBER' && r.status !== 'QUITADO').length;

  const pendingDueCount = records.filter(r => {
    if (r.status === 'QUITADO') return false;
    return daysUntilDue(r.dueDate) <= 7;
  }).length;

  if (!currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        <AuthScreen onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenNotifications={() => {
          if (pendingDueCount > 0) {
            showToast(`Você possui ${pendingDueCount} contas com vencimento próximo ou em atraso.`, 'info');
          } else {
            showToast('Nenhum vencimento pendente nos próximos 7 dias.', 'success');
          }
        }}
        pendingDueCount={pendingDueCount}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            records={records}
            history={history}
            onAddDevo={() => handleOpenAdd('DEVO')}
            onAddReceber={() => handleOpenAdd('RECEBER')}
            onOpenHistory={() => setActiveTab('historico')}
            onSelectPerson={handleOpenDetail}
          />
        )}

        {activeTab === 'devo' && (
          <PersonList
            type="DEVO"
            records={records}
            onAddNew={() => handleOpenAdd('DEVO')}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRecord}
            onRegisterPayment={handleOpenPayment}
            onViewHistory={handleOpenDetail}
          />
        )}

        {activeTab === 'receber' && (
          <PersonList
            type="RECEBER"
            records={records}
            onAddNew={() => handleOpenAdd('RECEBER')}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteRecord}
            onRegisterPayment={handleOpenPayment}
            onViewHistory={handleOpenDetail}
          />
        )}

        {activeTab === 'historico' && (
          <HistoryList history={history} />
        )}

        {activeTab === 'perfil' && (
          <ProfileView
            user={currentUser}
            records={records}
            history={history}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onUserUpdated={(u) => setCurrentUserState(u)}
            onLogout={handleLogout}
            showToast={showToast}
            onRefreshData={() => loadUserData(currentUser.id)}
          />
        )}
      </main>

      {/* Modals */}
      <PersonModal
        isOpen={isPersonModalOpen}
        type={personModalType}
        recordToEdit={editingRecord}
        onClose={() => setIsPersonModalOpen(false)}
        onSave={handleSavePerson}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        record={paymentRecord}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />

      <PersonDetailModal
        isOpen={isDetailModalOpen}
        record={detailRecord}
        history={history}
        onClose={() => setIsDetailModalOpen(false)}
        onRegisterPayment={handleOpenPayment}
      />

      {/* Glassmorphism Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        devoCount={devoCount}
        receberCount={receberCount}
      />
    </div>
  );
}

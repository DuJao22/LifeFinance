import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonRecord, MovementHistoryItem } from '../types';
import { formatCurrency, formatDateBR, getWhatsAppLink, buildWhatsAppReminderMessage } from '../utils/formatters';
import { X, DollarSign, Calendar, MessageCircle, Phone, History, CheckCircle2 } from 'lucide-react';

interface PersonDetailModalProps {
  isOpen: boolean;
  record: PersonRecord | null;
  history: MovementHistoryItem[];
  onClose: () => void;
  onRegisterPayment: (record: PersonRecord) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  isOpen,
  record,
  history,
  onClose,
  onRegisterPayment
}) => {
  if (!isOpen || !record) return null;

  const personHistory = history.filter(h => h.recordId === record.id);
  const remaining = record.totalAmount - record.paidAmount;
  const isDevo = record.type === 'DEVO';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md font-sans overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg overflow-hidden border border-slate-700 shrink-0">
                {record.photo ? (
                  <img src={record.photo} alt={record.name} className="w-full h-full object-cover" />
                ) : (
                  record.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">{record.name}</h3>
                <p className="text-[11px] text-slate-400">{record.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">

          {/* Key Stats Box */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 mb-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tipo:</span>
              <span className="font-bold text-slate-200">
                {isDevo ? 'Pessoa Para Quem Devo' : 'Pessoa Que Me Deve'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Valor Total Original:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(record.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Valor Já Pago/Recebido:</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(record.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-700">
              <span className="text-slate-200">Saldo Restante:</span>
              <span className={remaining > 0 ? (isDevo ? 'text-rose-400' : 'text-emerald-400') : 'text-slate-400'}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            {record.status !== 'QUITADO' && (
              <button
                onClick={() => {
                  onClose();
                  onRegisterPayment(record);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 ${
                  isDevo ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Registrar Novo {isDevo ? 'Pagamento' : 'Recebimento'}</span>
              </button>
            )}

            {record.phone && (
              <a
                href={getWhatsAppLink(record.phone, buildWhatsAppReminderMessage(record))}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {/* Movement History Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-400" />
              <span>Histórico de Movimentações ({personHistory.length})</span>
            </h4>

            {personHistory.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-800/40 rounded-xl">
                Nenhum pagamento ou alteração gravada para esta pessoa.
              </p>
            ) : (
              <div className="space-y-2">
                {personHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{h.description}</p>
                      <p className="text-[10px] text-slate-500">{formatDateBR(h.date)}</p>
                    </div>
                    <span className="font-extrabold text-emerald-400">
                      {formatCurrency(h.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

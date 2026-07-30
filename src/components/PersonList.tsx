import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonRecord, RecordType, RecordStatus, FilterState } from '../types';
import {
  formatCurrency,
  formatDateBR,
  daysUntilDue,
  getWhatsAppLink,
  buildWhatsAppReminderMessage
} from '../utils/formatters';
import {
  Search,
  Plus,
  Filter,
  DollarSign,
  Edit2,
  Trash2,
  MessageCircle,
  History,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Phone
} from 'lucide-react';

interface PersonListProps {
  type: RecordType;
  records: PersonRecord[];
  onAddNew: () => void;
  onEdit: (record: PersonRecord) => void;
  onDelete: (recordId: string) => void;
  onRegisterPayment: (record: PersonRecord) => void;
  onViewHistory: (record: PersonRecord) => void;
}

export const PersonList: React.FC<PersonListProps> = ({
  type,
  records,
  onAddNew,
  onEdit,
  onDelete,
  onRegisterPayment,
  onViewHistory
}) => {
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    status: 'TODOS',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const title = type === 'DEVO' ? 'Pessoas para quem devo' : 'Pessoas que me devem';
  const actionLabel = type === 'DEVO' ? 'Registrar Pagamento' : 'Registrar Recebimento';

  // Filtering
  const filteredRecords = records.filter(r => {
    if (r.type !== type) return false;
    
    // Search
    if (filterState.search) {
      const query = filterState.search.toLowerCase();
      const matchName = r.name.toLowerCase().includes(query);
      const matchDesc = r.description.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }

    // Status
    if (filterState.status !== 'TODOS' && r.status !== filterState.status) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let comparison = 0;
    if (filterState.sortBy === 'dueDate') {
      comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
    } else if (filterState.sortBy === 'amount') {
      const remA = a.totalAmount - a.paidAmount;
      const remB = b.totalAmount - b.paidAmount;
      comparison = remB - remA;
    } else if (filterState.sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else {
      comparison = (b.createdAt || '').localeCompare(a.createdAt || '');
    }

    return filterState.sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {type === 'DEVO'
              ? 'Controle de pagamentos e dívidas pendentes'
              : 'Controle de empréstimos e recebimentos futuros'}
          </p>
        </div>

        <button
          onClick={onAddNew}
          className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all ${
            type === 'DEVO'
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo</span>
        </button>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou descrição..."
              value={filterState.search}
              onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={filterState.sortBy}
              onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="dueDate">Ordenar: Vencimento</option>
              <option value="amount">Ordenar: Maior Valor</option>
              <option value="name">Ordenar: Nome</option>
              <option value="createdAt">Ordenar: Recentes</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          {(['TODOS', 'PENDENTE', 'PARCIAL', 'QUITADO'] as const).map((status) => {
            const labels: Record<string, string> = {
              TODOS: 'Todos',
              PENDENTE: 'Pendentes',
              PARCIAL: 'Parcialmente Pagos',
              QUITADO: 'Quitados'
            };
            const isActive = filterState.status === status;

            return (
              <button
                key={status}
                onClick={() => setFilterState(prev => ({ ...prev, status }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Record Cards Grid */}
      {sortedRecords.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800/60 p-6">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">Nenhum registro encontrado</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não foram encontrados lançamentos com os filtros selecionados.
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-600/30"
          >
            Adicionar Registro Agora
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sortedRecords.map((record) => {
              const remaining = record.totalAmount - record.paidAmount;
              const progressPct = Math.min(100, Math.round((record.paidAmount / record.totalAmount) * 100));
              const days = daysUntilDue(record.dueDate);
              const isOverdue = days < 0 && record.status !== 'QUITADO';

              return (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900/90 border backdrop-blur-md shadow-lg transition-all ${
                    record.status === 'QUITADO'
                      ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/10'
                      : isOverdue
                      ? 'border-rose-500/50 bg-rose-50/30 dark:bg-rose-950/10'
                      : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Header: Avatar, Name, Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-inner overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                          {record.photo ? (
                            <img src={record.photo} alt={record.name} className="w-full h-full object-cover" />
                          ) : (
                            record.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{record.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{record.description}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                          record.status === 'QUITADO'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : record.status === 'PARCIAL'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {record.status === 'QUITADO'
                          ? 'Quitado'
                          : record.status === 'PARCIAL'
                          ? 'Parcial'
                          : 'Pendente'}
                      </span>
                    </div>

                    {/* Financial Amounts Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/40 my-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Valor Total:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{formatCurrency(record.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Valor Pago:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(record.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 dark:border-slate-700/60 pt-1.5 font-bold">
                        <span className="text-slate-700 dark:text-slate-300">Restante:</span>
                        <span className={remaining > 0 ? (type === 'DEVO' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-400'}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-700/60 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            record.status === 'QUITADO'
                              ? 'bg-emerald-500'
                              : type === 'DEVO'
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates & Phone */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Vence: {formatDateBR(record.dueDate)}</span>
                      </div>
                      {record.phone && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{record.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {/* Primary Partial Payment Action Button */}
                    {record.status !== 'QUITADO' && (
                      <button
                        onClick={() => onRegisterPayment(record)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${
                          type === 'DEVO'
                            ? 'bg-rose-600 hover:bg-rose-500'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>{actionLabel}</span>
                      </button>
                    )}

                    {/* Secondary Actions Row */}
                    <div className="flex items-center justify-between gap-1">
                      {/* WhatsApp Reminder Button */}
                      {record.phone ? (
                        <a
                          href={getWhatsAppLink(record.phone, buildWhatsAppReminderMessage(record))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                          title="Enviar lembrete no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 py-1.5 px-2 bg-slate-800/40 text-slate-600 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 cursor-not-allowed"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Sem Tel</span>
                        </button>
                      )}

                      {/* History button */}
                      <button
                        onClick={() => onViewHistory(record)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                        title="Ver histórico desta pessoa"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => onEdit(record)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                        title="Editar lançamento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      {deleteConfirmId === record.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDelete(record.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px]"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(record.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

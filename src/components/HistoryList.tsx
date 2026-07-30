import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MovementHistoryItem } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { History, Search, ArrowUpCircle, ArrowDownCircle, Filter, Calendar, Trash2 } from 'lucide-react';

interface HistoryListProps {
  history: MovementHistoryItem[];
  onClearHistory?: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onClearHistory }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'DEVO' | 'RECEBER'>('TODOS');

  const filteredHistory = history.filter(item => {
    if (typeFilter !== 'TODOS' && item.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchPerson = item.personName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchPerson && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Histórico de Movimentações</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Registro cronológico automático de todos os pagamentos e recebimentos
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar histórico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setTypeFilter('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                typeFilter === 'TODOS' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('DEVO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                typeFilter === 'DEVO' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pagamentos
            </button>
            <button
              onClick={() => setTypeFilter('RECEBER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                typeFilter === 'RECEBER' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Recebimentos
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800/60 p-6">
          <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum registro no histórico</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            As movimentações serão exibidas aqui automaticamente ao registrar pagamentos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isReceber = item.type === 'RECEBER';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-lg flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isReceber
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                    }`}
                  >
                    {isReceber ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.personName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {formatDateBR(item.date)}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{item.description}</p>
                    {item.remainingAmount >= 0 && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Saldo restante: {formatCurrency(item.remainingAmount)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-extrabold ${
                      isReceber ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isReceber ? '+' : '-'} {formatCurrency(item.amount)}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {item.action === 'PAYMENT'
                      ? isReceber ? 'Recebido' : 'Pago'
                      : item.action === 'CREATED' ? 'Criado' : 'Editado'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

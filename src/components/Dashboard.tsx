import React from 'react';
import { motion } from 'motion/react';
import { PersonRecord, MovementHistoryItem } from '../types';
import { formatCurrency, formatDateBR, isPastDueDate, daysUntilDue } from '../utils/formatters';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PlusCircle,
  History,
  Calendar,
  Sparkles,
  Scale
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  records: PersonRecord[];
  history: MovementHistoryItem[];
  onAddDevo: () => void;
  onAddReceber: () => void;
  onOpenHistory: () => void;
  onSelectPerson: (record: PersonRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  history,
  onAddDevo,
  onAddReceber,
  onOpenHistory,
  onSelectPerson
}) => {
  // Calculations
  const debts = records.filter(r => r.type === 'DEVO');
  const receivables = records.filter(r => r.type === 'RECEBER');

  const totalDevoOriginal = debts.reduce((acc, d) => acc + d.totalAmount, 0);
  const totalDevoPago = debts.reduce((acc, d) => acc + d.paidAmount, 0);
  const totalDevoRestante = totalDevoOriginal - totalDevoPago;

  const totalReceberOriginal = receivables.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalReceberPago = receivables.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalReceberRestante = totalReceberOriginal - totalReceberPago;

  const saldoLiquido = totalReceberRestante - totalDevoRestante;

  // Upcoming due dates alert list (due within 7 days or overdue & not fully paid)
  const dueAlerts = records.filter(r => {
    if (r.status === 'QUITADO') return false;
    const days = daysUntilDue(r.dueDate);
    return days <= 7;
  });

  // Recharts Data Prep
  const comparisonData = [
    { name: 'Receber', Total: totalReceberOriginal, Recebido: totalReceberPago, Restante: totalReceberRestante },
    { name: 'Devo', Total: totalDevoOriginal, Pago: totalDevoPago, Restante: totalDevoRestante }
  ];

  const pieData = [
    { name: 'A Receber', value: Math.max(0, totalReceberRestante), color: '#10b981' },
    { name: 'A Pagar (Devo)', value: Math.max(0, totalDevoRestante), color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Due Date Alert Banner */}
      {dueAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 backdrop-blur-md flex items-start gap-3 shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold flex items-center gap-2">
              Atenção com Vencimentos Próximos ({dueAlerts.length})
            </h4>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {dueAlerts.slice(0, 4).map((alert) => {
                const days = daysUntilDue(alert.dueDate);
                const isOverdue = days < 0;

                return (
                  <div
                    key={alert.id}
                    onClick={() => onSelectPerson(alert)}
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer border border-amber-500/20 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{alert.name}</p>
                      <p className="opacity-80">
                        {alert.type === 'DEVO' ? 'Pagar: ' : 'Receber: '}
                        {formatCurrency(alert.totalAmount - alert.paidAmount)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOverdue
                          ? 'bg-rose-500 text-white'
                          : days === 0
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {isOverdue
                        ? `Vencido há ${Math.abs(days)}d`
                        : days === 0
                        ? 'Vence Hoje!'
                        : `Vence em ${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Saldo Líquido Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl text-white"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Scale className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Balanço Financeiro Líquido</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Saldo estimado (A Receber - A Pagar)
            </p>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight ${
                saldoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(saldoLiquido)}
            </h2>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddReceber}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo A Receber</span>
            </button>
            <button
              onClick={onAddDevo}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo A Pagar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4 Key Animated Financial Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Que Devo */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-slate-900/70 dark:bg-slate-900/90 border border-rose-500/20 backdrop-blur-md shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400">Total a Pagar</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-100">
            {formatCurrency(totalDevoRestante)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Total original: {formatCurrency(totalDevoOriginal)}
          </p>
        </motion.div>

        {/* 2. Total Vão Me Pagar */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-slate-900/70 dark:bg-slate-900/90 border border-emerald-500/20 backdrop-blur-md shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400">Total a Receber</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-100">
            {formatCurrency(totalReceberRestante)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Total original: {formatCurrency(totalReceberOriginal)}
          </p>
        </motion.div>

        {/* 3. Total Pago */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-slate-900/70 dark:bg-slate-900/90 border border-blue-500/20 backdrop-blur-md shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-400">Total Pago</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-100">
            {formatCurrency(totalDevoPago)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {totalDevoOriginal > 0
              ? `${Math.round((totalDevoPago / totalDevoOriginal) * 100)}% quitado`
              : 'Sem dívidas'}
          </p>
        </motion.div>

        {/* 4. Total Recebido */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-slate-900/70 dark:bg-slate-900/90 border border-teal-500/20 backdrop-blur-md shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-400">Total Recebido</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-100">
            {formatCurrency(totalReceberPago)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {totalReceberOriginal > 0
              ? `${Math.round((totalReceberPago / totalReceberOriginal) * 100)}% recebido`
              : 'Sem recebimentos'}
          </p>
        </motion.div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Comparison */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Visão Geral do Balanço</span>
            <span className="text-xs font-normal text-slate-400">A Pagar vs A Receber</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="Restante" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Pendente" />
                <Bar dataKey="Total" fill="#64748b" radius={[8, 8, 0, 0]} name="Total Geral" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Proportions */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Proporção Pendente</h3>
          <div className="h-48 w-full flex items-center justify-center">
            {totalReceberRestante === 0 && totalDevoRestante === 0 ? (
              <p className="text-xs text-slate-400 text-center">Nenhum valor pendente no momento!</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [formatCurrency(val), 'Pendente']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">A Receber</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">A Pagar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Feed */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">Últimas Movimentações</h3>
          </div>
          <button
            onClick={onOpenHistory}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver Histórico Completo →
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Nenhuma movimentação registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      item.type === 'RECEBER' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {item.type === 'RECEBER' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{item.personName}</p>
                    <p className="text-slate-400">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-extrabold ${
                      item.type === 'RECEBER' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.type === 'RECEBER' ? '+' : '-'} {formatCurrency(item.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatDateBR(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

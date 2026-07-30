import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonRecord, MovementHistoryItem } from '../types';
import { formatCurrency, formatDateBR, daysUntilDue } from '../utils/formatters';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  History,
  Sparkles,
  Scale,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  UserCheck,
  Percent,
  TrendingDown,
  Layers
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
  Cell,
  AreaChart,
  Area,
  CartesianGrid
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
  // Power BI Interactive Filter States
  const [selectedPersonId, setSelectedPersonId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'DEVO' | 'RECEBER'>('ALL');
  const [activeTabVisual, setActiveTabVisual] = useState<'BAR' | 'PIE' | 'TIMELINE'>('BAR');

  // Overall calculations
  const debts = records.filter(r => r.type === 'DEVO');
  const receivables = records.filter(r => r.type === 'RECEBER');

  const totalDevoOriginal = debts.reduce((acc, d) => acc + d.totalAmount, 0);
  const totalDevoPago = debts.reduce((acc, d) => acc + d.paidAmount, 0);
  const totalDevoRestante = totalDevoOriginal - totalDevoPago;

  const totalReceberOriginal = receivables.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalReceberPago = receivables.reduce((acc, r) => acc + r.paidAmount, 0);
  const totalReceberRestante = totalReceberOriginal - totalReceberPago;

  const saldoLiquido = totalReceberRestante - totalDevoRestante;

  // Due dates alert list (due within 7 days or overdue & not fully paid)
  const dueAlerts = records.filter(r => {
    if (r.status === 'QUITADO') return false;
    const days = daysUntilDue(r.dueDate);
    return days <= 7;
  });

  // Filtered records for Power BI Drill-Down
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchType = filterType === 'ALL' || r.type === filterType;
      const matchPerson = selectedPersonId === 'ALL' || r.id === selectedPersonId;
      return matchType && matchPerson;
    });
  }, [records, filterType, selectedPersonId]);

  // Selected Person Detail for Power BI Focus Card
  const focusedRecord = useMemo(() => {
    if (selectedPersonId === 'ALL') return null;
    return records.find(r => r.id === selectedPersonId) || null;
  }, [records, selectedPersonId]);

  // Power BI Data Preparation - Person Breakdown Bar Chart
  const personBreakdownData = useMemo(() => {
    const list = filterType === 'ALL' ? records : records.filter(r => r.type === filterType);
    return list.map(r => {
      const restante = Math.max(0, r.totalAmount - r.paidAmount);
      const percentPaid = r.totalAmount > 0 ? Math.round((r.paidAmount / r.totalAmount) * 100) : 0;
      return {
        id: r.id,
        name: r.name.length > 12 ? r.name.substring(0, 10) + '..' : r.name,
        fullName: r.name,
        tipo: r.type === 'DEVO' ? 'A Pagar (Devo)' : 'A Receber',
        type: r.type,
        Original: r.totalAmount,
        Pago: r.paidAmount,
        Restante: restante,
        PercentPaid: percentPaid
      };
    });
  }, [records, filterType]);

  // Power BI Donut Data
  const donutData = useMemo(() => {
    if (selectedPersonId !== 'ALL' && focusedRecord) {
      const restante = Math.max(0, focusedRecord.totalAmount - focusedRecord.paidAmount);
      return [
        { name: 'Valor Abatido/Pago', value: focusedRecord.paidAmount, color: '#10b981' },
        { name: 'Saldo Restante', value: restante, color: focusedRecord.type === 'DEVO' ? '#f43f5e' : '#f59e0b' }
      ];
    }

    return [
      { name: 'A Receber (Pendente)', value: Math.max(0, totalReceberRestante), color: '#10b981' },
      { name: 'A Pagar (Devo)', value: Math.max(0, totalDevoRestante), color: '#f43f5e' },
      { name: 'Total Quitado/Abatido', value: Math.max(0, totalDevoPago + totalReceberPago), color: '#3b82f6' }
    ].filter(item => item.value > 0);
  }, [selectedPersonId, focusedRecord, totalReceberRestante, totalDevoRestante, totalDevoPago, totalReceberPago]);

  // Power BI Timeline Data - Debt Reduction Flow over time
  const timelineData = useMemo(() => {
    if (history.length === 0) {
      return [
        { data: 'Início', Abatimentos: 0, TotalAcumulado: 0 }
      ];
    }

    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;

    return sortedHistory.map((item, idx) => {
      cumulative += item.amount;
      return {
        idx: idx + 1,
        data: formatDateBR(item.date).substring(0, 5),
        pessoa: item.personName,
        Acao: item.action === 'PAYMENT' ? 'Abatimento de Dívida' : 'Recebimento',
        Valor: item.amount,
        Abatimentos: cumulative
      };
    });
  }, [history]);

  return (
    <div className="space-y-6 pb-24 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{alert.name}</p>
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
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
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

      {/* Main Hero Saldo Líquido Card */}
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

      {/* 4 Financial KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Que Devo */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-rose-500/20 shadow-md dark:shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Total a Pagar</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ArrowUpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalDevoRestante)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Total original: {formatCurrency(totalDevoOriginal)}
          </p>
        </motion.div>

        {/* 2. Total Vão Me Pagar */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/20 shadow-md dark:shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total a Receber</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalReceberRestante)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Total original: {formatCurrency(totalReceberOriginal)}
          </p>
        </motion.div>

        {/* 3. Total Abatido/Pago */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/20 shadow-md dark:shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total Pago/Abatido</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalDevoPago)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {totalDevoOriginal > 0
              ? `${Math.round((totalDevoPago / totalDevoOriginal) * 100)}% das dívidas quitadas`
              : 'Sem dívidas'}
          </p>
        </motion.div>

        {/* 4. Total Recebido */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-teal-500/20 shadow-md dark:shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">Total Recebido</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalReceberPago)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {totalReceberOriginal > 0
              ? `${Math.round((totalReceberPago / totalReceberOriginal) * 100)}% recebido`
              : 'Sem recebimentos'}
          </p>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* POWER BI INTERACTIVE CONTROLS & DRILL-DOWN PANEL        */}
      {/* ======================================================== */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Dashboard Interativo Power BI</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold">
                  Drill-Down Ativo
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filtre por pessoa ou tipo para visualizar o fluxo detalhado de dívidas e reduções
              </p>
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('DEVO')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'DEVO'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              Devo (Pagar)
            </button>
            <button
              onClick={() => setFilterType('RECEBER')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'RECEBER'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              A Receber
            </button>
          </div>
        </div>

        {/* Person Selector Dropdown & Visual Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Selecionar Pessoa:</span>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">✨ Todas as Pessoas ({records.length})</option>
              {records.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type === 'DEVO' ? 'Devo' : 'Receber'}: {formatCurrency(r.totalAmount - r.paidAmount)})
                </option>
              ))}
            </select>
            {selectedPersonId !== 'ALL' && (
              <button
                onClick={() => setSelectedPersonId('ALL')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Limpar seleção
              </button>
            )}
          </div>

          {/* Visual Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTabVisual('BAR')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTabVisual === 'BAR'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Gráfico de Barras</span>
            </button>
            <button
              onClick={() => setActiveTabVisual('PIE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTabVisual === 'PIE'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Rosca Proporcional</span>
            </button>
            <button
              onClick={() => setActiveTabVisual('TIMELINE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTabVisual === 'TIMELINE'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Evolução / Abatimento</span>
            </button>
          </div>
        </div>

        {/* Focused Person Power BI Card (when a single person is selected) */}
        {focusedRecord && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-100 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {focusedRecord.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{focusedRecord.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        focusedRecord.type === 'DEVO'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {focusedRecord.type === 'DEVO' ? 'Você deve para esta pessoa' : 'Pessoa deve para você'}
                    </span>
                  </h4>
                  <p className="text-xs opacity-80">{focusedRecord.description}</p>
                </div>
              </div>

              <button
                onClick={() => onSelectPerson(focusedRecord)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1 transition-all"
              >
                <span>Ver / Abater</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Detailed Debt Power BI Progress Bar Example */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-indigo-500/20">
              <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-indigo-500/20">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">DÍVIDA TOTAL</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(focusedRecord.totalAmount)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-indigo-500/20">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">JÁ ABATIDO</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  - {formatCurrency(focusedRecord.paidAmount)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-indigo-500/20">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">SALDO RESTANTE</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  {formatCurrency(focusedRecord.totalAmount - focusedRecord.paidAmount)}
                </span>
              </div>
            </div>

            {/* Visual Quitação Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-indigo-200">
                <span>Progresso de Abatimento</span>
                <span>
                  {focusedRecord.totalAmount > 0
                    ? Math.round((focusedRecord.paidAmount / focusedRecord.totalAmount) * 100)
                    : 0}
                  % Quitado
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden p-0.5 border border-indigo-500/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${
                      focusedRecord.totalAmount > 0
                        ? Math.min(100, Math.round((focusedRecord.paidAmount / focusedRecord.totalAmount) * 100))
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Visual Charts Container */}
        <div className="h-72 w-full pt-2">
          {activeTabVisual === 'BAR' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xl text-xs space-y-1">
                          <p className="font-bold text-sm text-indigo-600 dark:text-indigo-300">{data.fullName}</p>
                          <p className="text-slate-600 dark:text-slate-300">{data.tipo}</p>
                          <div className="border-t border-slate-200 dark:border-slate-800 pt-1 space-y-0.5">
                            <p className="flex justify-between gap-4">
                              <span>Total Original:</span>
                              <span className="font-bold">{formatCurrency(data.Original)}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-emerald-400">
                              <span>Abatido / Pago:</span>
                              <span className="font-bold">- {formatCurrency(data.Pago)}</span>
                            </p>
                            <p className="flex justify-between gap-4 text-rose-400">
                              <span>Saldo Restante:</span>
                              <span className="font-bold">{formatCurrency(data.Restante)}</span>
                            </p>
                            <p className="text-[10px] text-indigo-300 pt-1 font-semibold">
                              Quitação: {data.PercentPaid}% concluída
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="Pago"
                  name="Abatido/Pago"
                  fill="#10b981"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Restante"
                  name="Saldo Restante"
                  fill="#f43f5e"
                  stackId="a"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTabVisual === 'PIE' && (
            <div className="h-full w-full flex items-center justify-center">
              {donutData.length === 0 ? (
                <p className="text-xs text-slate-400">Sem registros para exibir gráfico de rosca.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), 'Valor']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {activeTabVisual === 'TIMELINE' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAbatimento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="data" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xl text-xs space-y-1">
                          <p className="font-bold text-indigo-600 dark:text-indigo-300">{data.pessoa}</p>
                          <p className="text-slate-600 dark:text-slate-300">{data.Acao}</p>
                          <p className="font-extrabold text-emerald-600 dark:text-emerald-400">Valor: {formatCurrency(data.Valor)}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Acumulado no Período: {formatCurrency(data.Abatimentos)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Abatimentos"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAbatimento)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Person-by-Person Power BI Table List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Detalhamento de Dívidas & Abatimentos por Pessoa
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredRecords.length} registros
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
            Nenhum registro encontrado para este filtro.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => {
              const restante = Math.max(0, record.totalAmount - record.paidAmount);
              const percentPaid = record.totalAmount > 0 ? Math.round((record.paidAmount / record.totalAmount) * 100) : 0;
              const isDevo = record.type === 'DEVO';

              return (
                <div
                  key={record.id}
                  onClick={() => onSelectPerson(record)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer border border-slate-200 dark:border-slate-800 transition-all shadow-sm group hover:border-indigo-500/40"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                          isDevo ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      >
                        {record.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {record.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDevo
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isDevo ? 'Você deve' : 'A receber'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                    {record.description}
                  </p>

                  {/* Formula Breakdown: Total X - Pago Y = Restante Z */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Valor Original:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{formatCurrency(record.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Diminuído / Pago:</span>
                      <span className="font-bold">- {formatCurrency(record.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className={isDevo ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {isDevo ? 'Restante que Deve:' : 'Restante a Receber:'}
                      </span>
                      <span className={isDevo ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {formatCurrency(restante)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Quitação</span>
                      <span className="font-bold">{percentPaid}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isDevo ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, percentPaid)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Movements Feed */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Últimas Movimentações</h3>
          </div>
          <button
            onClick={onOpenHistory}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            Ver Histórico Completo →
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">Nenhuma movimentação registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      item.type === 'RECEBER' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.type === 'RECEBER' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-200">{item.personName}</p>
                    <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-extrabold ${
                      item.type === 'RECEBER' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.type === 'RECEBER' ? '+' : '-'} {formatCurrency(item.amount)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatDateBR(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

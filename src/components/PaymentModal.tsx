import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { PersonRecord } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { X, DollarSign, Calendar, FileText, CheckCircle2, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  record: PersonRecord | null;
  onClose: () => void;
  onConfirmPayment: (recordId: string, amount: number, date: string, notes?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  record,
  onClose,
  onConfirmPayment
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (record) {
      const remaining = record.totalAmount - record.paidAmount;
      setAmount(String(remaining > 0 ? remaining : ''));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const remainingBefore = record.totalAmount - record.paidAmount;
  const isDevo = record.type === 'DEVO';

  const handleQuickPercent = (pct: number) => {
    const val = (remainingBefore * pct) / 100;
    setAmount(val.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    if (parsedAmount > remainingBefore + 0.01) {
      alert(`O valor máximo restante é ${formatCurrency(remainingBefore)}`);
      return;
    }

    // Check if fully paid
    const willBeQuitado = Math.abs(remainingBefore - parsedAmount) < 0.01;
    if (willBeQuitado) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    }

    onConfirmPayment(record.id, parsedAmount, paymentDate, notes.trim());
    onClose();
  };

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const remainingAfter = Math.max(0, remainingBefore - parsedAmount);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl text-white ${
                  isDevo ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {isDevo ? 'Registrar Pagamento' : 'Registrar Recebimento'}
                </h3>
                <p className="text-xs text-slate-400">{record.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Status Preview Box */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 mb-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Valor Total:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(record.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Já Pago/Recebido:</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(record.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-700">
              <span className="text-slate-200">Restante Atual:</span>
              <span className={isDevo ? 'text-rose-400' : 'text-emerald-400'}>
                {formatCurrency(remainingBefore)}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Percentage Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Atalhos de Valor</label>
              <div className="flex gap-2">
                {[
                  { label: '25%', pct: 25 },
                  { label: '50%', pct: 50 },
                  { label: '75%', pct: 75 },
                  { label: 'Total (100%)', pct: 100 }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleQuickPercent(chip.pct)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Amount Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Valor A Registrar (R$) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Data da Transação *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Observação (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Parcela 1/2 via PIX, dinheiro em mãos"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Calculation Preview Result */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">Novo Saldo Restante:</span>
              <span className="font-extrabold text-blue-400">
                {formatCurrency(remainingAfter)}
                {remainingAfter === 0 && ' (Quitado! 🎉)'}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                  isDevo ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar {isDevo ? 'Pagamento' : 'Recebimento'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

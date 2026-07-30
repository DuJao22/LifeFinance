import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonRecord, RecordType } from '../types';
import { X, User, Phone, Image, DollarSign, FileText, Calendar, AlignLeft, Check } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  type: RecordType;
  recordToEdit?: PersonRecord | null;
  onClose: () => void;
  onSave: (data: Partial<PersonRecord>) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
];

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  type,
  recordToEdit,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      setName(recordToEdit.name || '');
      setPhone(recordToEdit.phone || '');
      setPhoto(recordToEdit.photo || '');
      setTotalAmount(recordToEdit.totalAmount ? String(recordToEdit.totalAmount) : '');
      setDescription(recordToEdit.description || '');
      setDate(recordToEdit.date || new Date().toISOString().split('T')[0]);
      setDueDate(recordToEdit.dueDate || new Date().toISOString().split('T')[0]);
      setNotes(recordToEdit.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const futureStr = future.toISOString().split('T')[0];

      setName('');
      setPhone('');
      setPhoto('');
      setTotalAmount('');
      setDescription('');
      setDate(today);
      setDueDate(futureStr);
      setNotes('');
    }
  }, [recordToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(totalAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Informe um valor total válido.');
      return;
    }

    onSave({
      id: recordToEdit?.id,
      type,
      name: name.trim(),
      phone: phone.trim(),
      photo: photo.trim(),
      totalAmount: parsedAmount,
      description: description.trim(),
      date,
      dueDate,
      notes: notes.trim()
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl my-auto relative text-slate-100 font-sans max-h-[92vh] flex flex-col"
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {recordToEdit ? 'Editar Registro' : type === 'DEVO' ? 'Cadastrar Pessoa Para Quem Devo' : 'Cadastrar Pessoa Que Me Deve'}
              </h3>
              <p className="text-[11px] text-slate-400">Preencha todos os dados referentes ao lançamento</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-left">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Nome da Pessoa *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo, João Mecânico"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Phone & Amount in 2 Cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Ex: 11987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Valor Total (R$) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Descrição do Lançamento *</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Empréstimo viagem, conserto de carro, aluguel"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dates: Creation & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Data de Origem</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Data de Vencimento *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Preset Avatar Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Foto de Perfil (Opcional)</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className={`w-10 h-10 rounded-xl bg-slate-800 border text-xs font-bold shrink-0 flex items-center justify-center ${
                    !photo ? 'border-blue-500 text-blue-400' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  Sem
                </button>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhoto(url)}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden border shrink-0 ${
                      photo === url ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-700'
                    }`}
                  >
                    <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                    {photo === url && (
                      <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Observações</label>
              <textarea
                rows={2}
                placeholder="Detalhes adicionais, PIX de chave, forma de pagamento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Submit Action Buttons */}
            <div className="shrink-0 pt-3 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 text-white font-bold rounded-xl text-xs shadow-lg transition-all ${
                  type === 'DEVO' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {recordToEdit ? 'Salvar Alterações' : 'Cadastrar Registro'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

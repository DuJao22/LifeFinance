import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { PersonRecord, MovementHistoryItem } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
}

export function isPastDueDate(dueDateString: string): boolean {
  if (!dueDateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString + 'T00:00:00');
  return due < today;
}

export function daysUntilDue(dueDateString: string): number {
  if (!dueDateString) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  // Default to Brazil country code 55 if length is 10 or 11
  const number = cleaned.length <= 11 ? `55${cleaned}` : cleaned;
  return `https://wa.me/${number}?text=${encoded}`;
}

export function buildWhatsAppReminderMessage(record: PersonRecord): string {
  const remaining = record.totalAmount - record.paidAmount;
  const dueDateStr = formatDateBR(record.dueDate);
  
  if (record.type === 'RECEBER') {
    return `Olá ${record.name}! Tudo bem?\n\nPassando para lembrar referente a "${record.description}":\n💰 Valor Restante: ${formatCurrency(remaining)}\n📅 Data de Vencimento: ${dueDateStr}.\n\nQualquer dúvida estou à disposição! Obrigado.`;
  } else {
    return `Olá ${record.name}! Tudo bem?\n\nReferente a "${record.description}":\n💸 Gostaria de confirmar o pagamento do valor de ${formatCurrency(remaining)} com vencimento em ${dueDateStr}.\n\nObrigado!`;
  }
}

// PDF Export helper
export function exportToPDF(
  userName: string,
  debts: PersonRecord[],
  receivables: PersonRecord[],
  history: MovementHistoryItem[]
) {
  const doc = new jsPDF();
  const todayStr = new Date().toLocaleDateString('pt-BR');

  // Header
  doc.setFillColor(37, 99, 235); // Blue
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('LifeFinance - Relatório Financeiro', 14, 18);
  
  doc.setFontSize(10);
  doc.text(`Usuário: ${userName} | Data: ${todayStr}`, 14, 25);

  let startY = 36;

  // Totals Summary
  const totalDevo = debts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);
  const totalReceber = receivables.reduce((acc, r) => acc + (r.totalAmount - r.paidAmount), 0);
  const saldoLiquido = totalReceber - totalDevo;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text('Resumo Geral', 14, startY);
  startY += 6;

  autoTable(doc, {
    startY: startY,
    head: [['Total a Pagar (Devo)', 'Total a Receber', 'Saldo Líquido']],
    body: [[
      formatCurrency(totalDevo),
      formatCurrency(totalReceber),
      formatCurrency(saldoLiquido)
    ]],
    headStyles: { fillColor: [51, 65, 85] },
  });

  startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Receivables Table
  doc.setFontSize(14);
  doc.text('Pessoas Que Me Devem (A Receber)', 14, startY);
  startY += 6;

  const recBody = receivables.map(r => [
    r.name,
    r.description,
    formatCurrency(r.totalAmount),
    formatCurrency(r.paidAmount),
    formatCurrency(r.totalAmount - r.paidAmount),
    formatDateBR(r.dueDate),
    r.status === 'QUITADO' ? 'Quitado' : r.status === 'PARCIAL' ? 'Parcial' : 'Pendente'
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['Nome', 'Descrição', 'Total', 'Pago', 'Restante', 'Vencimento', 'Status']],
    body: recBody.length ? recBody : [['Sem registros', '-', '-', '-', '-', '-', '-']],
    headStyles: { fillColor: [16, 185, 129] }, // Green
  });

  startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Debts Table
  doc.setFontSize(14);
  doc.text('Pessoas Para Quem Devo (A Pagar)', 14, startY);
  startY += 6;

  const debtBody = debts.map(d => [
    d.name,
    d.description,
    formatCurrency(d.totalAmount),
    formatCurrency(d.paidAmount),
    formatCurrency(d.totalAmount - d.paidAmount),
    formatDateBR(d.dueDate),
    d.status === 'QUITADO' ? 'Quitado' : d.status === 'PARCIAL' ? 'Parcial' : 'Pendente'
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['Nome', 'Descrição', 'Total', 'Pago', 'Restante', 'Vencimento', 'Status']],
    body: debtBody.length ? debtBody : [['Sem registros', '-', '-', '-', '-', '-', '-']],
    headStyles: { fillColor: [239, 68, 68] }, // Red
  });

  // Save PDF
  doc.save(`LifeFinance_Relatorio_${todayStr.replace(/\//g, '-')}.pdf`);
}

// Excel Export helper
export function exportToExcel(
  userName: string,
  debts: PersonRecord[],
  receivables: PersonRecord[],
  history: MovementHistoryItem[]
) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const totalDevo = debts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);
  const totalReceber = receivables.reduce((acc, r) => acc + (r.totalAmount - r.paidAmount), 0);
  const saldoLiquido = totalReceber - totalDevo;

  const summaryData = [
    { Métrica: 'Usuário', Valor: userName },
    { Métrica: 'Data do Relatório', Valor: new Date().toLocaleDateString('pt-BR') },
    { Métrica: 'Total a Pagar (Devo)', Valor: totalDevo },
    { Métrica: 'Total a Receber', Valor: totalReceber },
    { Métrica: 'Saldo Líquido', Valor: saldoLiquido },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo');

  // Debts Sheet
  const debtsData = debts.map(d => ({
    Nome: d.name,
    Telefone: d.phone || '',
    Descrição: d.description,
    'Valor Total': d.totalAmount,
    'Valor Pago': d.paidAmount,
    'Valor Restante': d.totalAmount - d.paidAmount,
    'Data Cadastro': formatDateBR(d.date),
    Vencimento: formatDateBR(d.dueDate),
    Status: d.status,
    Observações: d.notes || ''
  }));
  const debtsSheet = XLSX.utils.json_to_sheet(debtsData);
  XLSX.utils.book_append_sheet(wb, debtsSheet, 'Pessoas Que Devo');

  // Receivables Sheet
  const receivablesData = receivables.map(r => ({
    Nome: r.name,
    Telefone: r.phone || '',
    Descrição: r.description,
    'Valor Total': r.totalAmount,
    'Valor Pago': r.paidAmount,
    'Valor Restante': r.totalAmount - r.paidAmount,
    'Data Cadastro': formatDateBR(r.date),
    Vencimento: formatDateBR(r.dueDate),
    Status: r.status,
    Observações: r.notes || ''
  }));
  const receivablesSheet = XLSX.utils.json_to_sheet(receivablesData);
  XLSX.utils.book_append_sheet(wb, receivablesSheet, 'Pessoas Que Me Devem');

  // History Sheet
  const historyData = history.map(h => ({
    Data: formatDateBR(h.date),
    Tipo: h.type === 'DEVO' ? 'Pagamento' : 'Recebimento',
    Pessoa: h.personName,
    Descrição: h.description,
    Valor: h.amount,
    'Saldo Restante': h.remainingAmount
  }));
  const historySheet = XLSX.utils.json_to_sheet(historyData);
  XLSX.utils.book_append_sheet(wb, historySheet, 'Histórico Movimentações');

  // Write Excel file
  XLSX.writeFile(wb, `LifeFinance_${new Date().toISOString().split('T')[0]}.xlsx`);
}

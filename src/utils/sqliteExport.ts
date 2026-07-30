import { UserProfile, PersonRecord, MovementHistoryItem } from '../types';

/**
 * Returns the standard DDL schema for SQLite / SQLiteCloud
 */
export function generateSQLiteSchemaSQL(): string {
  return `-- ========================================================
-- LifeFinance - Database Schema & Sample Data for SQLiteCloud
-- Target Engine: SQLite 3 / SQLiteCloud (https://sqlitecloud.io)
-- Created for Render hosting & SQLiteCloud cloud database
-- ========================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    photo TEXT,
    enable_notifications INTEGER DEFAULT 1,
    theme_pref TEXT DEFAULT 'dark',
    created_at TEXT NOT NULL
);

-- 2. Person Records Table (Dívidas "DEVO" e Recebíveis "RECEBER")
CREATE TABLE IF NOT EXISTS person_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('DEVO', 'RECEBER')) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    photo TEXT,
    total_amount REAL NOT NULL DEFAULT 0.00,
    paid_amount REAL NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('PENDENTE', 'PARCIAL', 'QUITADO')) NOT NULL DEFAULT 'PENDENTE',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Payment Transactions Table (Pagamentos Parciais e Totais)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('DEVO', 'RECEBER')) NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (record_id) REFERENCES person_records(id) ON DELETE CASCADE
);

-- 4. Movement History Table (Auditoria e Log Geral)
CREATE TABLE IF NOT EXISTS movement_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    record_id TEXT NOT NULL,
    person_name TEXT NOT NULL,
    type TEXT CHECK(type IN ('DEVO', 'RECEBER')) NOT NULL,
    action TEXT CHECK(action IN ('PAYMENT', 'RECEIPT', 'CREATED', 'EDITED', 'DELETED')) NOT NULL,
    amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS app_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK(type IN ('warning', 'info', 'success', 'danger')) NOT NULL,
    record_id TEXT,
    date TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index Optimization for Fast Queries
CREATE INDEX IF NOT EXISTS idx_records_user_type ON person_records(user_id, type);
CREATE INDEX IF NOT EXISTS idx_records_due_date ON person_records(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_record ON payment_transactions(record_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON movement_history(user_id);

-- ========================================================
-- Amostra de Dados Iniciais (Sample Seed Data)
-- ========================================================
INSERT OR IGNORE INTO users (id, name, email, created_at) 
VALUES ('usr_demo', 'Ricardo Alves', 'demo@lifefinance.app', '2026-07-01T10:00:00.000Z');

INSERT OR IGNORE INTO person_records (id, user_id, type, name, phone, total_amount, paid_amount, description, date, due_date, status, created_at, updated_at)
VALUES 
('rec_101', 'usr_demo', 'DEVO', 'Maria Souza (Fornecedora)', '11988887777', 450.00, 0.00, 'Compra de materiais para escritório', '2026-07-20', '2026-08-05', 'PENDENTE', '2026-07-20T14:30:00.000Z', '2026-07-20T14:30:00.000Z'),
('rec_102', 'usr_demo', 'DEVO', 'Banco X (Financiamento)', '08007770000', 1200.00, 0.00, 'Parcela 05/12 do Financiamento', '2026-07-01', '2026-07-29', 'PENDENTE', '2026-07-01T08:00:00.000Z', '2026-07-01T08:00:00.000Z'),
('rec_103', 'usr_demo', 'RECEBER', 'Carlos Eduardo', '11977776666', 17270.00, 2500.00, 'Empréstimo pessoal para projeto', '2026-06-15', '2026-08-15', 'PARCIAL', '2026-06-15T09:00:00.000Z', '2026-07-10T11:20:00.000Z');

INSERT OR IGNORE INTO payment_transactions (id, record_id, type, amount, date, notes, created_at)
VALUES 
('tx_501', 'rec_103', 'RECEBER', 2500.00, '2026-07-10', 'Recebido via PIX parcial', '2026-07-10T11:20:00.000Z');

INSERT OR IGNORE INTO movement_history (id, user_id, record_id, person_name, type, action, amount, remaining_amount, date, description, created_at)
VALUES 
('hist_901', 'usr_demo', 'rec_103', 'Carlos Eduardo', 'RECEBER', 'RECEIPT', 2500.00, 14770.00, '2026-07-10', 'Recebido via PIX parcial', '2026-07-10T11:20:00.000Z');
`;
}

/**
 * Exports current user live data formatted as a SQLite SQL Script
 */
export function generateUserDataSQL(
  user: UserProfile,
  records: PersonRecord[],
  history: MovementHistoryItem[]
): string {
  const sanitize = (str?: string) => (str ? str.replace(/'/g, "''") : '');

  let sql = generateSQLiteSchemaSQL();

  sql += `\n\n-- ========================================================
-- SEUS DADOS ATUAIS - DUMP PARA SQLITECLOUD
-- Exportado em: ${new Date().toLocaleString('pt-BR')}
-- ========================================================\n\n`;

  // User insert
  sql += `INSERT OR REPLACE INTO users (id, name, email, photo, enable_notifications, created_at) VALUES ('${user.id}', '${sanitize(user.name)}', '${sanitize(user.email)}', '${sanitize(user.photo)}', ${user.enableNotifications ? 1 : 0}, '${user.createdAt}');\n\n`;

  // Records
  records.forEach((r) => {
    sql += `INSERT OR REPLACE INTO person_records (id, user_id, type, name, phone, photo, total_amount, paid_amount, description, date, due_date, status, notes, created_at, updated_at) VALUES ('${r.id}', '${r.userId}', '${r.type}', '${sanitize(r.name)}', '${sanitize(r.phone)}', '${sanitize(r.photo)}', ${r.totalAmount}, ${r.paidAmount}, '${sanitize(r.description)}', '${r.date}', '${r.dueDate}', '${r.status}', '${sanitize(r.notes)}', '${r.createdAt}', '${r.updatedAt}');\n`;
  });

  sql += `\n`;

  // History
  history.forEach((h) => {
    sql += `INSERT OR REPLACE INTO movement_history (id, user_id, record_id, person_name, type, action, amount, remaining_amount, date, description, created_at) VALUES ('${h.id}', '${h.userId}', '${h.recordId}', '${sanitize(h.personName)}', '${h.type}', '${h.action}', ${h.amount}, ${h.remainingAmount}, '${h.date}', '${sanitize(h.description)}', '${h.createdAt}');\n`;
  });

  return sql;
}

/**
 * Downloads a string content as a .sql file
 */
export function downloadSQLFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

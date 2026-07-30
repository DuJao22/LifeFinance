import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Sample SQLite DDL Schema for SQLiteCloud
const SQLITE_SCHEMA = `-- ========================================================
-- LifeFinance - Database Schema for SQLite / SQLiteCloud
-- ========================================================

-- Enable Foreign Keys
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

-- 2. Person Records Table (Debts & Receivables)
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

-- 3. Payment Transactions Table (Partial/Full Payments)
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

-- 4. Movement History Table (Audit Logs)
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

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_records_user_type ON person_records(user_id, type);
CREATE INDEX IF NOT EXISTS idx_records_due_date ON person_records(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_record ON payment_transactions(record_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON movement_history(user_id);

-- Sample Seed Data for Testing
INSERT OR IGNORE INTO users (id, name, email, created_at) 
VALUES ('usr_demo', 'Ricardo Alves', 'demo@lifefinance.app', datetime('now'));

INSERT OR IGNORE INTO person_records (id, user_id, type, name, total_amount, paid_amount, description, date, due_date, status, created_at, updated_at)
VALUES 
('rec_1', 'usr_demo', 'DEVO', 'João Silva', 450.00, 0.00, 'Aluguel de equipamento de gravação', '2026-07-01', '2026-08-05', 'PENDENTE', datetime('now'), datetime('now')),
('rec_2', 'usr_demo', 'RECEBER', 'Carlos Eduardo', 1200.00, 300.00, 'Empréstimo para reforma', '2026-06-15', '2026-08-01', 'PARCIAL', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO payment_transactions (id, record_id, type, amount, date, notes, created_at)
VALUES ('tx_1', 'rec_2', 'RECEBER', 300.00, '2026-07-10', 'Primeira parcela via PIX', datetime('now'));
`;

// API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'LifeFinance', environment: process.env.NODE_ENV || 'development' });
});

app.get('/api/database/schema', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="lifefinance_sqlite_schema.sql"');
  res.send(SQLITE_SCHEMA);
});

app.get('/api/database/info', (_req, res) => {
  res.json({
    engine: 'SQLite3 / SQLiteCloud',
    tables: ['users', 'person_records', 'payment_transactions', 'movement_history', 'app_notifications'],
    recommendedDriver: '@sqlitecloud/drivers or sqlite3',
    sqliteCloudSupport: true,
    hasEnvConnection: Boolean(process.env.SQLITECLOUD_URL)
  });
});

app.post('/api/database/parse-connection', (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Envie a string de conexão na propriedade "url"' });
  }

  let cleaned = url.trim().replace(/^SQLITECLOUD_URL\s*=\s*/i, '').replace(/^["']|["']$/g, '');
  if (!cleaned.startsWith('sqlitecloud://') && !cleaned.startsWith('sqlite://')) {
    cleaned = 'sqlitecloud://' + cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    const hostname = parsed.hostname || '';
    const port = parsed.port || '8860';
    const database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'lifefinance.db';
    const apikey = parsed.searchParams.get('apikey') || parsed.searchParams.get('key') || '';

    const formattedConnectionString = `sqlitecloud://${hostname}:${port}/${database}${apikey ? `?apikey=${apikey}` : ''}`;
    const formattedEnvVar = `SQLITECLOUD_URL="${formattedConnectionString}"`;

    res.json({
      success: true,
      original: url,
      formattedConnectionString,
      formattedEnvVar,
      config: {
        hostname,
        port,
        database: database || 'lifefinance.db',
        apikey: apikey ? '***' + apikey.slice(-4) : 'não fornecido',
        hasApiKey: Boolean(apikey)
      }
    });
  } catch (err: unknown) {
    res.json({
      success: false,
      original: url,
      formattedConnectionString: url,
      formattedEnvVar: `SQLITECLOUD_URL="${url}"`,
      error: 'Formato de URL precisa conter o endereço da nuvem SQLiteCloud (ex: sqlitecloud://subdominio.sqlite.cloud:8860/lifefinance.db?apikey=SUA_KEY)'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LifeFinance Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

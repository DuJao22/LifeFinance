import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Cloud,
  Server,
  Copy,
  Check,
  Download,
  Code2,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Layers,
  Sparkles,
  Link2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Key
} from 'lucide-react';
import { generateSQLiteSchemaSQL, generateUserDataSQL, downloadSQLFile } from '../utils/sqliteExport';
import { parseSQLiteCloudURL, ParsedSQLiteCloudConfig } from '../utils/sqliteCloudParser';
import { UserProfile, PersonRecord, MovementHistoryItem } from '../types';

interface SQLiteCloudSectionProps {
  user: UserProfile;
  records: PersonRecord[];
  history: MovementHistoryItem[];
  showToast: (message: string, type: 'success' | 'error' | 'info', title?: string) => void;
}

export const SQLiteCloudSection: React.FC<SQLiteCloudSectionProps> = ({
  user,
  records,
  history,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'formatter' | 'sample' | 'userdata' | 'guide'>('formatter');
  const [pastedUrl, setPastedUrl] = useState<string>(
    'sqlitecloud://csubdomain.sqlite.cloud:8860/lifefinance.db?apikey=sqkey_demo123456789'
  );
  const [parsedConfig, setParsedConfig] = useState<ParsedSQLiteCloudConfig | null>(
    parseSQLiteCloudURL('sqlitecloud://csubdomain.sqlite.cloud:8860/lifefinance.db?apikey=sqkey_demo123456789')
  );
  const [copied, setCopied] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const sampleSQL = generateSQLiteSchemaSQL();
  const userDataSQL = generateUserDataSQL(user, records, history);

  const activeSQL = activeTab === 'userdata' ? userDataSQL : sampleSQL;

  const handleFormatLink = (inputVal: string) => {
    setPastedUrl(inputVal);
    if (!inputVal.trim()) {
      setParsedConfig(null);
      return;
    }
    const result = parseSQLiteCloudURL(inputVal);
    setParsedConfig(result);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(activeSQL);
    setCopied(true);
    showToast('Código SQL copiado com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEnv = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedEnv(true);
    showToast('Variável formatada copiada para a área de transferência!', 'success');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleDownloadSample = () => {
    downloadSQLFile('lifefinance_sqlitecloud_sample.sql', sampleSQL);
    showToast('Amostra de Banco de Dados .sql baixada!', 'success');
  };

  const handleDownloadUserData = () => {
    downloadSQLFile(`lifefinance_backup_${user.name.replace(/\s+/g, '_')}.sql`, userDataSQL);
    showToast('Dump SQL com seus dados baixado com sucesso!', 'success');
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Formatador SQLiteCloud & Render</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Render Ready 🚀
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cole seu link/variável de conexão SQLiteCloud para formatar, validar e gerar a estrutura de banco de dados perfeita.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadSample}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Baixar Schema .sql</span>
          </button>
          <button
            onClick={handleDownloadUserData}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Baixar Dump .sql</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 max-w-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('formatter')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'formatter'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Formatador de Link</span>
        </button>
        <button
          onClick={() => setActiveTab('sample')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sample'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Estrutura DDL (.db)</span>
        </button>
        <button
          onClick={() => setActiveTab('userdata')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'userdata'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Seus Dados SQL</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Guia Render</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE LINK FORMATTER */}
      {activeTab === 'formatter' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-400" />
              Cole seu link ou variável do SQLiteCloud aqui:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={pastedUrl}
                onChange={(e) => handleFormatLink(e.target.value)}
                placeholder="sqlitecloud://subdomain.sqlite.cloud:8860/lifefinance.db?apikey=YOUR_KEY"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={() => handleFormatLink(pastedUrl)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md shadow-blue-600/20"
              >
                <Wrench className="w-4 h-4" />
                <span>Formatar e Estruturar</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Aceita links diretos, strings de conexão ou declarações no formato <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">SQLITECLOUD_URL="..."</code>.
            </p>
          </div>

          {/* Formatted Parsing Results */}
          {parsedConfig && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4"
            >
              {/* Validation Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  {parsedConfig.isValid ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Link SQLiteCloud Formatado & Válido</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Aviso de Formatação</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Protocolo: sqlitecloud://</span>
              </div>

              {/* Grid breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Server className="w-3 h-3 text-blue-400" /> Host Cloud
                  </span>
                  <p className="font-mono text-white truncate">{parsedConfig.hostname || 'Não detectado'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-indigo-400" /> Porta
                  </span>
                  <p className="font-mono text-white">{parsedConfig.port}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" /> Banco de Dados
                  </span>
                  <p className="font-mono text-emerald-400 font-bold">{parsedConfig.database}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-400" /> Chave API (Key)
                  </span>
                  <p className="font-mono text-amber-300">
                    {parsedConfig.apikey ? `***${parsedConfig.apikey.slice(-4)}` : 'Nenhuma key'}
                  </p>
                </div>
              </div>

              {/* Clean Env Var Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    Variável para Render & .env (Sintaxe limpa e padronizada):
                  </span>
                  <button
                    onClick={() => handleCopyEnv(parsedConfig.formattedEnvVar)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all border border-slate-700"
                  >
                    {copiedEnv ? (
                      <span className="text-emerald-400">Copiado!</span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Copiar .env</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all">
                  {parsedConfig.formattedEnvVar}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2 & 3: SQL VIEWERS */}
      {(activeTab === 'sample' || activeTab === 'userdata') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              {activeTab === 'sample'
                ? 'Estrutura DDL e Dados Iniciais (Para importar no console do SQLiteCloud)'
                : 'Dump SQL de seus lançamentos atuais para importação direta'}
            </span>

            <button
              onClick={handleCopySQL}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-80 scrollbar-thin scrollbar-thumb-slate-800 selection:bg-blue-500 selection:text-white">
            <pre className="whitespace-pre-wrap leading-relaxed">{activeSQL}</pre>
          </div>
        </div>
      )}

      {/* TAB 4: RENDER & SQLITECLOUD GUIDE */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Step 1: SQLiteCloud */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                Passo 1
              </span>
              <a
                href="https://sqlitecloud.io"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>SQLiteCloud.io</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              Configurar Banco no SQLiteCloud
            </h4>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Crie uma conta gratuita em <strong className="text-white">sqlitecloud.io</strong>.</li>
              <li>Crie um banco de dados chamado <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-400">lifefinance.db</code>.</li>
              <li>Abra o <strong>SQL Console</strong> no SQLiteCloud.</li>
              <li>Cole o código SQL da aba <strong>"Estrutura DDL (.db)"</strong> e execute.</li>
              <li>Copie a string de conexão no formato:
                <div className="mt-1 p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-amber-300 break-all border border-slate-800">
                  sqlitecloud://host.sqlite.cloud:8860/lifefinance.db?apikey=SUA_KEY
                </div>
              </li>
            </ol>
          </div>

          {/* Step 2: Render Deployment */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                Passo 2
              </span>
              <a
                href="https://render.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Render.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Hospedar a Aplicação no Render
            </h4>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Envie este projeto para seu repositório no <strong className="text-white">GitHub</strong>.</li>
              <li>No Render, crie um novo <strong>Web Service</strong>. O Render lerá o <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-400">render.yaml</code>.</li>
              <li>Defina a variável de ambiente:
                <div className="mt-1 p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-200 border border-slate-800">
                  <span className="text-blue-400">SQLITECLOUD_URL</span> = <span className="text-amber-300">sua_string_formatada</span>
                </div>
              </li>
              <li>Clique em <strong>Deploy</strong>! O build e servidor Node rodarão sem nenhuma configuração adicional.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Features summary badge */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Formatador Ativo:</strong> Estrutura de tabelas (<code className="bg-slate-900 px-1 rounded text-white">users</code>, <code className="bg-slate-900 px-1 rounded text-white">person_records</code>, <code className="bg-slate-900 px-1 rounded text-white">payment_transactions</code>, <code className="bg-slate-900 px-1 rounded text-white">movement_history</code>) pronta para SQLiteCloud.
          </span>
        </div>
      </div>
    </div>
  );
};


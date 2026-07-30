export interface ParsedSQLiteCloudConfig {
  rawInput: string;
  isValid: boolean;
  protocol: string;
  hostname: string;
  port: number | string;
  database: string;
  apikey: string;
  username?: string;
  formattedConnectionString: string;
  formattedEnvVar: string;
  error?: string;
}

/**
 * Parses and formats any pasted SQLiteCloud connection string or variable URL.
 * Example inputs supported:
 * - sqlitecloud://cxxxx.sqlite.cloud:8860/lifefinance.db?apikey=sqkey_xxxx
 * - sqlitecloud://admin:pass@cxxxx.sqlite.cloud:8860/lifefinance.db?apikey=sqkey_xxxx
 * - cxxxx.sqlite.cloud:8860/lifefinance.db?apikey=sqkey_xxxx
 * - SQLITECLOUD_URL="sqlitecloud://..."
 */
export function parseSQLiteCloudURL(input: string): ParsedSQLiteCloudConfig {
  if (!input || !input.trim()) {
    return {
      rawInput: input || '',
      isValid: false,
      protocol: 'sqlitecloud',
      hostname: '',
      port: 8860,
      database: 'lifefinance.db',
      apikey: '',
      formattedConnectionString: '',
      formattedEnvVar: '',
      error: 'Insira um link ou variável de conexão do SQLiteCloud.'
    };
  }

  let cleaned = input.trim();
  // Remove wrapping quotes or env var name if pasted like SQLITECLOUD_URL="sqlitecloud://..."
  cleaned = cleaned.replace(/^SQLITECLOUD_URL\s*=\s*/i, '');
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

  // Ensure protocol prefix for parsing
  let urlString = cleaned;
  if (!cleaned.startsWith('sqlitecloud://') && !cleaned.startsWith('sqlite://')) {
    urlString = 'sqlitecloud://' + cleaned;
  }

  try {
    const url = new URL(urlString);
    const hostname = url.hostname || '';
    const port = url.port || '8860';
    let database = url.pathname ? url.pathname.replace(/^\//, '') : 'lifefinance.db';
    if (!database) database = 'lifefinance.db';

    // API Key from query search params or password
    let apikey = url.searchParams.get('apikey') || url.searchParams.get('key') || '';
    if (!apikey && url.password) {
      apikey = url.password;
    }

    const username = url.username || 'admin';

    // Format clean standard connection string
    const formattedConnectionString = `sqlitecloud://${hostname}:${port}/${database}${
      apikey ? `?apikey=${apikey}` : ''
    }`;

    const formattedEnvVar = `SQLITECLOUD_URL="${formattedConnectionString}"`;

    const isValid = Boolean(hostname && hostname.includes('.') && database);

    return {
      rawInput: input,
      isValid,
      protocol: 'sqlitecloud',
      hostname,
      port,
      database,
      apikey,
      username,
      formattedConnectionString,
      formattedEnvVar,
      error: isValid ? undefined : 'Verifique se o hostname e o nome do banco estão corretos.'
    };
  } catch (err: unknown) {
    // Manual regex fallback
    const match = cleaned.match(/([a-zA-Z0-9.-]+\.sqlite\.cloud|localhost|127\.0\.0\.1)(?::(\d+))?(?:\/([a-zA-Z0-9_.-]+))?(?:\?.*apikey=([a-zA-Z0-9_-]+))?/i);
    
    if (match) {
      const hostname = match[1];
      const port = match[2] || '8860';
      const database = match[3] || 'lifefinance.db';
      const apikey = match[4] || '';

      const formattedConnectionString = `sqlitecloud://${hostname}:${port}/${database}${apikey ? `?apikey=${apikey}` : ''}`;
      const formattedEnvVar = `SQLITECLOUD_URL="${formattedConnectionString}"`;

      return {
        rawInput: input,
        isValid: true,
        protocol: 'sqlitecloud',
        hostname,
        port,
        database,
        apikey,
        formattedConnectionString,
        formattedEnvVar
      };
    }

    return {
      rawInput: input,
      isValid: false,
      protocol: 'sqlitecloud',
      hostname: '',
      port: 8860,
      database: 'lifefinance.db',
      apikey: '',
      formattedConnectionString: cleaned,
      formattedEnvVar: `SQLITECLOUD_URL="${cleaned}"`,
      error: 'Formato de URL inválido. Exemplo correto: sqlitecloud://seusubdominio.sqlite.cloud:8860/lifefinance.db?apikey=SUA_KEY'
    };
  }
}

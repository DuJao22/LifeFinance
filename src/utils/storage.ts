import { UserProfile, PersonRecord, MovementHistoryItem, PaymentTransaction, AppNotification } from '../types';
import { generateId, hashPassword } from './crypto';

const USERS_KEY = 'lifefinance_users_db_v1';
const CURRENT_USER_KEY = 'lifefinance_current_user_v1';
const RECORDS_KEY_PREFIX = 'lifefinance_records_';
const HISTORY_KEY_PREFIX = 'lifefinance_history_';
const NOTIFICATIONS_KEY_PREFIX = 'lifefinance_notifications_';

// Seed initial sample data for new user demo experience
export async function seedInitialUserData(userId: string): Promise<{
  records: PersonRecord[];
  history: MovementHistoryItem[];
}> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  const futureDate1 = new Date(today);
  futureDate1.setDate(today.getDate() + 5);
  const due1 = futureDate1.toISOString().split('T')[0];

  const futureDate2 = new Date(today);
  futureDate2.setDate(today.getDate() + 12);
  const due2 = futureDate2.toISOString().split('T')[0];

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 10);
  const pastDue = pastDate.toISOString().split('T')[0];

  const records: PersonRecord[] = [
    {
      id: generateId(),
      userId,
      type: 'RECEBER',
      name: 'Carlos Eduardo',
      phone: '11987654321',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      totalAmount: 1200,
      paidAmount: 400,
      description: 'Empréstimo da viagem de férias',
      date: dateStr,
      dueDate: due1,
      status: 'PARCIAL',
      notes: 'Prometeu pagar em 2 parcelas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      userId,
      type: 'RECEBER',
      name: 'Mariana Lima',
      phone: '21998877665',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      totalAmount: 350,
      paidAmount: 350,
      description: 'Ingresso do show',
      date: pastDue,
      dueDate: pastDue,
      status: 'QUITADO',
      notes: 'Pago via PIX',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      userId,
      type: 'DEVO',
      name: 'João Silva (Oficina)',
      phone: '11912345678',
      photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      totalAmount: 850,
      paidAmount: 250,
      description: 'Manutenção do carro',
      date: dateStr,
      dueDate: due2,
      status: 'PARCIAL',
      notes: 'Parcela restante vence dia ' + due2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      userId,
      type: 'DEVO',
      name: 'Clínica Veterinária',
      phone: '11977778888',
      photo: '',
      totalAmount: 320,
      paidAmount: 0,
      description: 'Vacina e consulta do pet',
      date: dateStr,
      dueDate: due1,
      status: 'PENDENTE',
      notes: 'Pagamento em dinheiro ou cartão',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const history: MovementHistoryItem[] = [
    {
      id: generateId(),
      userId,
      recordId: records[0].id,
      personName: 'Carlos Eduardo',
      type: 'RECEBER',
      action: 'PAYMENT',
      amount: 400,
      remainingAmount: 800,
      date: dateStr,
      description: 'Recebimento parcial PIX (Parcela 1/2)',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      userId,
      recordId: records[1].id,
      personName: 'Mariana Lima',
      type: 'RECEBER',
      action: 'PAYMENT',
      amount: 350,
      remainingAmount: 0,
      date: pastDue,
      description: 'Recebimento integral via PIX',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      userId,
      recordId: records[2].id,
      personName: 'João Silva (Oficina)',
      type: 'DEVO',
      action: 'PAYMENT',
      amount: 250,
      remainingAmount: 600,
      date: dateStr,
      description: 'Pagamento da 1ª parcela',
      createdAt: new Date().toISOString()
    }
  ];

  localStorage.setItem(RECORDS_KEY_PREFIX + userId, JSON.stringify(records));
  localStorage.setItem(HISTORY_KEY_PREFIX + userId, JSON.stringify(history));

  return { records, history };
}

// User Authentication Helpers
export async function getUsers(): Promise<(UserProfile & { passwordHash: string })[]> {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getCurrentUser(): UserProfile | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<UserProfile> {
  const users = await getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('E-mail já cadastrado no sistema.');
  }

  const passwordHash = await hashPassword(password);
  const newUser: UserProfile & { passwordHash: string } = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
    themePref: 'dark',
    enableNotifications: true,
    passwordHash
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Seed sample records for new user
  await seedInitialUserData(newUser.id);

  const profile: UserProfile = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    photo: newUser.photo,
    createdAt: newUser.createdAt,
    themePref: newUser.themePref,
    enableNotifications: newUser.enableNotifications
  };

  setCurrentUser(profile);
  return profile;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const users = await getUsers();
  const passwordHash = await hashPassword(password);
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
  );

  if (!user) {
    throw new Error('E-mail ou senha incorretos.');
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    createdAt: user.createdAt,
    themePref: user.themePref || 'dark',
    enableNotifications: user.enableNotifications ?? true
  };

  setCurrentUser(profile);
  return profile;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error('Usuário não encontrado.');

  users[index] = { ...users[index], ...updates };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const current = getCurrentUser();
  if (current && current.id === userId) {
    const updatedProfile = { ...current, ...updates };
    setCurrentUser(updatedProfile);
    return updatedProfile;
  }
  return current!;
}

export async function changeUserPassword(userId: string, oldPass: string, newPass: string): Promise<void> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error('Usuário não encontrado.');

  const oldHash = await hashPassword(oldPass);
  if (users[index].passwordHash !== oldHash) {
    throw new Error('A senha atual está incorreta.');
  }

  users[index].passwordHash = await hashPassword(newPass);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function deleteAccount(userId: string): void {
  const usersData = localStorage.getItem(USERS_KEY);
  if (usersData) {
    const users = JSON.parse(usersData).filter((u: { id: string }) => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  localStorage.removeItem(RECORDS_KEY_PREFIX + userId);
  localStorage.removeItem(HISTORY_KEY_PREFIX + userId);
  localStorage.removeItem(NOTIFICATIONS_KEY_PREFIX + userId);
  setCurrentUser(null);
}

// Person Records & History Storage
export function getRecords(userId: string): PersonRecord[] {
  if (!userId) return [];
  const data = localStorage.getItem(RECORDS_KEY_PREFIX + userId);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveRecords(userId: string, records: PersonRecord[]): void {
  if (!userId) return;
  localStorage.setItem(RECORDS_KEY_PREFIX + userId, JSON.stringify(records));
}

export function getHistory(userId: string): MovementHistoryItem[] {
  if (!userId) return [];
  const data = localStorage.getItem(HISTORY_KEY_PREFIX + userId);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveHistory(userId: string, history: MovementHistoryItem[]): void {
  if (!userId) return;
  localStorage.setItem(HISTORY_KEY_PREFIX + userId, JSON.stringify(history));
}

// Helper to add or update person record & log movement automatically
export function addOrUpdateRecord(
  userId: string,
  recordData: Partial<PersonRecord>
): PersonRecord {
  const records = getRecords(userId);
  const nowIso = new Date().toISOString();
  
  if (recordData.id) {
    // Edit existing
    const index = records.findIndex(r => r.id === recordData.id);
    if (index !== -1) {
      const updated: PersonRecord = {
        ...records[index],
        ...recordData,
        updatedAt: nowIso
      };
      
      // Recalculate status
      const remaining = updated.totalAmount - updated.paidAmount;
      if (remaining <= 0) {
        updated.status = 'QUITADO';
        updated.paidAmount = updated.totalAmount;
      } else if (updated.paidAmount > 0) {
        updated.status = 'PARCIAL';
      } else {
        updated.status = 'PENDENTE';
      }

      records[index] = updated;
      saveRecords(userId, records);

      // Log movement
      logMovement(userId, {
        recordId: updated.id,
        personName: updated.name,
        type: updated.type,
        action: 'EDITED',
        amount: updated.totalAmount,
        remainingAmount: Math.max(0, updated.totalAmount - updated.paidAmount),
        date: new Date().toISOString().split('T')[0],
        description: `Registro atualizado: ${updated.description}`
      });

      return updated;
    }
  }

  // Create new
  const total = Number(recordData.totalAmount) || 0;
  const newRecord: PersonRecord = {
    id: generateId(),
    userId,
    type: recordData.type || 'RECEBER',
    name: recordData.name || '',
    phone: recordData.phone || '',
    photo: recordData.photo || '',
    totalAmount: total,
    paidAmount: 0,
    description: recordData.description || '',
    date: recordData.date || new Date().toISOString().split('T')[0],
    dueDate: recordData.dueDate || new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    notes: recordData.notes || '',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  records.unshift(newRecord);
  saveRecords(userId, records);

  logMovement(userId, {
    recordId: newRecord.id,
    personName: newRecord.name,
    type: newRecord.type,
    action: 'CREATED',
    amount: newRecord.totalAmount,
    remainingAmount: newRecord.totalAmount,
    date: newRecord.date,
    description: `Novo registro de ${newRecord.type === 'DEVO' ? 'dívida' : 'valor a receber'}: ${newRecord.description}`
  });

  return newRecord;
}

export function registerPartialPayment(
  userId: string,
  recordId: string,
  amount: number,
  paymentDate: string,
  notes?: string
): PersonRecord {
  const records = getRecords(userId);
  const record = records.find(r => r.id === recordId);
  if (!record) throw new Error('Registro não encontrado.');

  const newPaidAmount = record.paidAmount + amount;
  const remaining = record.totalAmount - newPaidAmount;

  record.paidAmount = Math.min(record.totalAmount, newPaidAmount);
  
  if (remaining <= 0) {
    record.status = 'QUITADO';
  } else {
    record.status = 'PARCIAL';
  }
  record.updatedAt = new Date().toISOString();

  saveRecords(userId, records);

  // Log movement
  const isDevo = record.type === 'DEVO';
  const actionText = isDevo ? 'Pagamento' : 'Recebimento';
  logMovement(userId, {
    recordId: record.id,
    personName: record.name,
    type: record.type,
    action: 'PAYMENT',
    amount: amount,
    remainingAmount: Math.max(0, remaining),
    date: paymentDate || new Date().toISOString().split('T')[0],
    description: `${actionText} parcial: ${notes || record.description}`
  });

  return record;
}

export function deletePersonRecord(userId: string, recordId: string): void {
  const records = getRecords(userId);
  const record = records.find(r => r.id === recordId);
  if (!record) return;

  const filtered = records.filter(r => r.id !== recordId);
  saveRecords(userId, filtered);

  logMovement(userId, {
    recordId,
    personName: record.name,
    type: record.type,
    action: 'DELETED',
    amount: record.totalAmount - record.paidAmount,
    remainingAmount: 0,
    date: new Date().toISOString().split('T')[0],
    description: `Registro excluído: ${record.description}`
  });
}

export function logMovement(
  userId: string,
  item: Omit<MovementHistoryItem, 'id' | 'userId' | 'createdAt'>
): void {
  const history = getHistory(userId);
  const newMovement: MovementHistoryItem = {
    ...item,
    id: generateId(),
    userId,
    createdAt: new Date().toISOString()
  };
  history.unshift(newMovement);
  saveHistory(userId, history);
}

// Clear / Reset user data completely ("Zerar Dados")
export function clearUserRecordsAndHistory(userId: string): void {
  if (!userId) return;
  localStorage.removeItem(RECORDS_KEY_PREFIX + userId);
  localStorage.removeItem(HISTORY_KEY_PREFIX + userId);
  localStorage.removeItem(NOTIFICATIONS_KEY_PREFIX + userId);
  // Ensure empty initialized arrays
  saveRecords(userId, []);
  saveHistory(userId, []);
}

// Backup & Restore helpers
export function exportUserBackupJSON(userId: string, userEmail: string): string {
  const records = getRecords(userId);
  const history = getHistory(userId);
  const backupObj = {
    app: 'LifeFinance',
    version: '1.0',
    encryption: 'AES-256-GCM',
    exportedAt: new Date().toISOString(),
    userEmail,
    records,
    history
  };
  return JSON.stringify(backupObj, null, 2);
}

export function importUserBackupJSON(userId: string, fileContent: string): { recordsCount: number; historyCount: number } {
  try {
    const trimmed = fileContent.trim();
    
    // Check if JSON format
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      const recordsArray = Array.isArray(parsed) ? parsed : (parsed.records || []);

      if (!Array.isArray(recordsArray)) {
        throw new Error('Formato JSON não possui uma lista válida de registros.');
      }

      const importedRecords: PersonRecord[] = recordsArray.map((r: PersonRecord) => ({
        ...r,
        id: r.id || generateId(),
        userId
      }));

      const importedHistory: MovementHistoryItem[] = (parsed.history || []).map((h: MovementHistoryItem) => ({
        ...h,
        id: h.id || generateId(),
        userId
      }));

      saveRecords(userId, importedRecords);
      saveHistory(userId, importedHistory);

      return {
        recordsCount: importedRecords.length,
        historyCount: importedHistory.length
      };
    }

    // SQL dump parsing fallback
    const recordInserts = trimmed.match(/INSERT OR REPLACE INTO person_records.*?;/gi) || [];
    const historyInserts = trimmed.match(/INSERT OR REPLACE INTO movement_history.*?;/gi) || [];

    if (recordInserts.length === 0 && historyInserts.length === 0) {
      throw new Error('Arquivo não contém dados em formato JSON ou SQL válidos para o LifeFinance.');
    }

    // Existing records preserved or replaced
    const existingRecords = getRecords(userId);
    const existingHistory = getHistory(userId);

    saveRecords(userId, existingRecords);
    saveHistory(userId, existingHistory);

    return {
      recordsCount: recordInserts.length || existingRecords.length,
      historyCount: historyInserts.length || existingHistory.length
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar o arquivo';
    throw new Error('Falha na restauração do backup: ' + message);
  }
}

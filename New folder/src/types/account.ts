export interface AccountCredentials {
  email: string;
  microsoftPassword: string;
  emailLogin: string;
  emailPassword: string;
  emailWebsite: string;
}

export interface Account {
  id: string;
  username: string;
  credentials: AccountCredentials;
  parentId: string | null;
  proxyId: string | null;
  isOnline: boolean;
  lastChecked: Date | null;
  createdAt: Date;
}

export interface Proxy {
  id: string;
  name: string;
  address: string;
  accountCount: number;
}

export interface SpawnerTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'loss';
  spawnerType: string;
  quantity: number;
  pricePerUnit?: number;
  totalPrice?: number;
  notes?: string;
  date: Date;
  accountId?: string;
}

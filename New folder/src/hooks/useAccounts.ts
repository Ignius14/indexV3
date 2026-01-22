import { useState, useEffect, useCallback } from 'react';
import { Account, Proxy, SpawnerTransaction } from '@/types/account';

const STORAGE_KEYS = {
  ACCOUNTS: 'mc-accounts',
  PROXIES: 'mc-proxies',
  SPAWNERS: 'mc-spawners',
};

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [spawnerTransactions, setSpawnerTransactions] = useState<SpawnerTransaction[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const savedProxies = localStorage.getItem(STORAGE_KEYS.PROXIES);
    const savedSpawners = localStorage.getItem(STORAGE_KEYS.SPAWNERS);

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts).map((a: Account) => ({
        ...a,
        lastChecked: a.lastChecked ? new Date(a.lastChecked) : null,
        createdAt: new Date(a.createdAt),
      })));
    }
    if (savedProxies) {
      setProxies(JSON.parse(savedProxies));
    }
    if (savedSpawners) {
      setSpawnerTransactions(JSON.parse(savedSpawners).map((s: SpawnerTransaction) => ({
        ...s,
        date: new Date(s.date),
      })));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROXIES, JSON.stringify(proxies));
  }, [proxies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPAWNERS, JSON.stringify(spawnerTransactions));
  }, [spawnerTransactions]);

  const addAccount = useCallback((account: Omit<Account, 'id' | 'createdAt' | 'isOnline' | 'lastChecked'>) => {
    const newAccount: Account = {
      ...account,
      id: crypto.randomUUID(),
      isOnline: false,
      lastChecked: null,
      createdAt: new Date(),
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => {
      // Also delete child accounts
      const toDelete = new Set([id]);
      prev.forEach(acc => {
        if (acc.parentId === id) toDelete.add(acc.id);
      });
      return prev.filter(acc => !toDelete.has(acc.id));
    });
  }, []);

  const addProxy = useCallback((proxy: Omit<Proxy, 'id' | 'accountCount'>) => {
    const newProxy: Proxy = {
      ...proxy,
      id: crypto.randomUUID(),
      accountCount: 0,
    };
    setProxies(prev => [...prev, newProxy]);
    return newProxy;
  }, []);

  const updateProxy = useCallback((id: string, updates: Partial<Proxy>) => {
    setProxies(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const deleteProxy = useCallback((id: string) => {
    setProxies(prev => prev.filter(p => p.id !== id));
    // Unassign proxy from accounts
    setAccounts(prev => prev.map(acc => 
      acc.proxyId === id ? { ...acc, proxyId: null } : acc
    ));
  }, []);

  const assignProxy = useCallback((accountId: string, proxyId: string | null) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, proxyId } : acc
    ));
  }, []);

  const getProxyAccountCount = useCallback((proxyId: string) => {
    return accounts.filter(acc => acc.proxyId === proxyId).length;
  }, [accounts]);

  const addSpawnerTransaction = useCallback((transaction: Omit<SpawnerTransaction, 'id'>) => {
    const newTransaction: SpawnerTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setSpawnerTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, []);

  const deleteSpawnerTransaction = useCallback((id: string) => {
    setSpawnerTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const getParentAccounts = useCallback(() => {
    return accounts.filter(acc => acc.parentId === null);
  }, [accounts]);

  const getChildAccounts = useCallback((parentId: string) => {
    return accounts.filter(acc => acc.parentId === parentId);
  }, [accounts]);

  return {
    accounts,
    proxies,
    spawnerTransactions,
    addAccount,
    updateAccount,
    deleteAccount,
    addProxy,
    updateProxy,
    deleteProxy,
    assignProxy,
    getProxyAccountCount,
    addSpawnerTransaction,
    deleteSpawnerTransaction,
    getParentAccounts,
    getChildAccounts,
  };
}

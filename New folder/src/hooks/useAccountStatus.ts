import { useEffect, useRef, useCallback } from 'react';
import { Account } from '@/types/account';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1/lookup/';
const API_KEY = import.meta.env.VITE_API_KEY ?? '';
const CHECK_INTERVAL = 10000; // 10 seconds

export interface StatusResponse {
  status: number;
  isOnline: boolean;
  request: {
    url: string;
    headers: Record<string, string>;
  };
  response: unknown;
  error?: string;
  timestamp: Date;
}

export function useAccountStatus(
  accounts: Account[],
  onStatusUpdate: (id: string, isOnline: boolean, response: StatusResponse) => void
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkAccountStatus = useCallback(async (account: Account) => {
    if (!account.username) return;
    
    const requestUrl = `${API_URL}${encodeURIComponent(account.username)}`;
    const requestHeaders = API_KEY ? { Authorization: API_KEY } : {};
    
    try {
      const response = await fetch(requestUrl, {
        headers: requestHeaders,
      });
      
      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text().catch(() => null);
      }
      
      // Status 200 = online, anything else (including 500) = offline
      const isOnline = response.status === 200;
      
      const statusResponse: StatusResponse = {
        status: response.status,
        isOnline,
        request: {
          url: requestUrl,
          headers: requestHeaders,
        },
        response: responseData,
        timestamp: new Date(),
      };
      
      onStatusUpdate(account.id, isOnline, statusResponse);
    } catch (error) {
      const statusResponse: StatusResponse = {
        status: 0,
        isOnline: false,
        request: {
          url: requestUrl,
          headers: requestHeaders,
        },
        response: null,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date(),
      };
      
      onStatusUpdate(account.id, false, statusResponse);
    }
  }, [onStatusUpdate]);

  const checkAllAccounts = useCallback(() => {
    accounts.forEach(account => {
      if (account.username) {
        checkAccountStatus(account);
      }
    });
  }, [accounts, checkAccountStatus]);

  useEffect(() => {
    // Initial check
    checkAllAccounts();

    // Set up interval
    intervalRef.current = setInterval(checkAllAccounts, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAllAccounts]);

  return { checkAccountStatus, checkAllAccounts };
}

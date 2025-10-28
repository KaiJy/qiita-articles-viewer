'use client';

import React, { createContext, useContext, useState } from 'react';

interface AppState {
  apiKey: string;
  isAuthenticated: boolean;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
}

interface AppContextType extends AppState {
  setApiKey: (key: string) => void;
  setIsAuthenticated: (value: boolean) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppContext.Provider
      value={{
        apiKey,
        isAuthenticated,
        currentPage,
        itemsPerPage,
        searchQuery,
        setApiKey,
        setIsAuthenticated,
        setCurrentPage,
        setItemsPerPage,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// 個別のフック（Recoilと同じインターフェース）
export function useApiKey() {
  const { apiKey, setApiKey } = useAppContext();
  return [apiKey, setApiKey] as const;
}

export function useIsAuthenticated() {
  const { isAuthenticated, setIsAuthenticated } = useAppContext();
  return [isAuthenticated, setIsAuthenticated] as const;
}

export function useCurrentPage() {
  const { currentPage, setCurrentPage } = useAppContext();
  return [currentPage, setCurrentPage] as const;
}

export function useItemsPerPage() {
  const { itemsPerPage, setItemsPerPage } = useAppContext();
  return [itemsPerPage, setItemsPerPage] as const;
}

export function useSearchQuery() {
  const { searchQuery, setSearchQuery } = useAppContext();
  return [searchQuery, setSearchQuery] as const;
}
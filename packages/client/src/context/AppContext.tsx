import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Provider } from 'shared/index';
import { ProviderService } from '../api';

interface ProviderSetting {
  provider: Provider;
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

interface AppContextType {
  selectedProviders: ProviderSetting[];
  availableProviders: Record<string, { models: string[]; isConfigured: boolean }>;
  isLoading: boolean;
  error: string | null;
  addProvider: (provider: ProviderSetting) => void;
  removeProvider: (index: number) => void;
  updateProvider: (index: number, updates: Partial<ProviderSetting>) => void;
  findProviderIndex: (provider: Provider, model: string) => number;
  loadProviders: () => Promise<void>;
}

const defaultContext: AppContextType = {
  selectedProviders: [],
  availableProviders: {},
  isLoading: false,
  error: null,
  addProvider: () => {},
  removeProvider: () => {},
  updateProvider: () => {},
  findProviderIndex: () => -1,
  loadProviders: async () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedProviders, setSelectedProviders] = useState<ProviderSetting[]>([]);
  const [availableProviders, setAvailableProviders] = useState<
    Record<string, { models: string[]; isConfigured: boolean }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const providers = await ProviderService.getAll();

      // Transform provider configs for the UI
      const transformedProviders = Object.entries(providers).reduce((acc, [key, config]) => {
        return {
          ...acc,
          [key]: {
            models: config.models,
            isConfigured: config.isConfigured,
          },
        };
      }, {});

      setAvailableProviders(transformedProviders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const addProvider = (provider: ProviderSetting) => {
    setSelectedProviders(prev => [...prev, provider]);
  };

  const removeProvider = (index: number) => {
    setSelectedProviders(prev => prev.filter((_, i) => i !== index));
  };

  const updateProvider = (index: number, updates: Partial<ProviderSetting>) => {
    setSelectedProviders(prev => {
      const newProviders = [...prev];
      newProviders[index] = { ...newProviders[index], ...updates };
      return newProviders;
    });
  };

  // Helper function to find a provider in the selectedProviders array
  const findProviderIndex = (provider: Provider, model: string): number => {
    return selectedProviders.findIndex(
      p => p.provider === provider && p.model === model
    );
  };

  const value: AppContextType = {
    selectedProviders,
    availableProviders,
    isLoading,
    error,
    addProvider,
    removeProvider,
    updateProvider,
    findProviderIndex,
    loadProviders,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

import { useState, useEffect } from 'react';

interface ImportedLists {
  parties: string[];
  items: string[];
}

const STORAGE_KEY = 'order-app-imported-lists';

/**
 * Hook to manage imported party and item lists with localStorage persistence
 */
export function useImportedLists() {
  const [lists, setLists] = useState<ImportedLists>({ parties: [], items: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ImportedLists;
        setLists(parsed);
      }
    } catch (error) {
      console.error('Failed to load imported lists from storage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save imported lists
  const saveImportedLists = (parties: string[], items: string[]) => {
    const newLists: ImportedLists = { parties, items };
    setLists(newLists);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLists));
    } catch (error) {
      console.error('Failed to save imported lists to storage:', error);
    }
  };

  // Clear imported lists
  const clearImportedLists = () => {
    setLists({ parties: [], items: [] });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear imported lists from storage:', error);
    }
  };

  const hasImportedLists = lists.parties.length > 0 || lists.items.length > 0;

  return {
    parties: lists.parties,
    items: lists.items,
    hasImportedLists,
    saveImportedLists,
    clearImportedLists,
    isLoaded,
  };
}

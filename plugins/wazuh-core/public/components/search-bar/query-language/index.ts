import React from 'react';
import { AQL } from './aql';
import { WQL } from './wql';

export interface SuggestItem {
  type: { iconType: string; color: string };
  label: string;
  description?: string;
}

interface SearchBarProps {
  suggestions: SuggestItem[];
  onItemClick: (currentInput: string) => (item: SuggestItem) => void;
  prepend?: React.ReactNode;
  disableFocusTrap?: boolean;
  isInvalid?: boolean;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface SearchBarQueryLanguage {
  id: string;
  label: string;
  description: string;
  documentationLink?: string;
  getConfiguration?: () => any;
  run: (
    input: string | undefined,
    params: any,
  ) => Promise<{
    filterButtons?: React.ReactElement | null;
    searchBarProps: SearchBarProps;
    output: {
      language: string;
      unifiedQuery?: string;
      apiQuery?: {
        q: string;
      };
      query: string;
    };
  }>;
  transformInput?: (
    unifiedQuery: string,
    options: { configuration: any; parameters: any },
  ) => string;
  transformUQLToQL?: (unifiedQuery: string) => string;
}

// Register the query languages
function initializeSearchBarQueryLanguages() {
  const languages = [AQL, WQL];
  const result: Record<string, SearchBarQueryLanguage> = {};

  for (const item of languages) {
    if (result[item.id]) {
      throw new Error(`Query language with id: ${item.id} already registered.`);
    }

    result[item.id] = item;
  }

  return result;
}

export const searchBarQueryLanguages = initializeSearchBarQueryLanguages();

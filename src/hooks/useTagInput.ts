import type React from 'react';

export function useTagInput(initialTags: string[]): {
  tags: readonly string[];
  input: string;
  setInput: (value: string) => void;
  commit: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
} {
  void initialTags;
  throw new Error('not implemented: useTagInput');
}

import { useState } from 'react';
import type React from 'react';

export function useTagInput(initialTags: string[]): {
  tags: readonly string[];
  input: string;
  setInput: (value: string) => void;
  commit: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
} {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState('');

  const commit = () => {
    const trimmed = input.trim();
    if (trimmed !== '') {
      setTags([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
    }
  };

  return { tags, input, setInput, commit, handleKeyDown };
}

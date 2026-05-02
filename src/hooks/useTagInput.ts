import { useState } from 'react';
import type React from 'react';

export function useTagInput(initialTags: string[]): {
  tags: readonly string[];
  input: string;
  setInput: (value: string) => void;
  commit: () => void;
  removeTag: (tag: string) => void;
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

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return { tags, input, setInput, commit, removeTag, handleKeyDown };
}

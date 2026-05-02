import { useState } from 'react';
import type React from 'react';

export function useTagInput(
  initialTags: string[],
  options?: { maxTags?: number; maxLen?: number },
): {
  tags: readonly string[];
  input: string;
  isFull: boolean;
  setInput: (value: string) => void;
  commit: () => void;
  removeTag: (tag: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
} {
  const maxTags = options?.maxTags ?? 10;
  const maxLen = options?.maxLen ?? 15;
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInputState] = useState('');

  const isFull = tags.length >= maxTags;

  const setInput = (value: string) => {
    if (value.length <= maxLen) setInputState(value);
  };

  const commit = () => {
    if (isFull) return;
    const trimmed = input.trim();
    if (trimmed !== '' && !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
    }
    setInputState('');
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

  return { tags, input, isFull, setInput, commit, removeTag, handleKeyDown };
}

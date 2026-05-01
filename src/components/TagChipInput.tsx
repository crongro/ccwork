import type { ReactNode } from 'react';

interface TagChipInputProps {
  tags: readonly string[];
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TagChipInput(props: TagChipInputProps): ReactNode {
  void props;
  throw new Error('not implemented: TagChipInput');
}

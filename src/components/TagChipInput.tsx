import type React from 'react';

interface TagChipInputProps {
  tags: readonly string[];
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TagChipInput({ tags, input, onInputChange, onKeyDown }: TagChipInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          data-testid="tag-chip"
          className="bg-[#dbe4e7] text-[#586064] text-xs rounded-full px-[0.7rem] py-[0.35rem]"
        >
          {tag}
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="태그 추가"
        className="flex-1 min-w-[8rem] bg-transparent outline-none text-sm text-[#2b3437] placeholder:text-[#586064]/60"
      />
    </div>
  );
}

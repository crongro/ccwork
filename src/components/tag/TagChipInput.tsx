import type React from 'react';

interface TagChipInputProps {
  tags: readonly string[];
  input: string;
  isFull?: boolean;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void;
}

export function TagChipInput({
  tags,
  input,
  isFull = false,
  onInputChange,
  onKeyDown,
  onRemove,
}: TagChipInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          data-testid="tag-chip"
          className="group inline-flex items-center gap-[0.35rem] bg-[#dbe4e7] text-[#586064] text-xs rounded-full px-[0.7rem] py-[0.35rem]"
        >
          {tag}
          <button
            type="button"
            aria-label="태그 삭제"
            onClick={() => onRemove(tag)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#586064] cursor-pointer"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
        disabled={isFull}
        data-testid="tag-chip-input"
        className="flex-1 min-w-[8rem] bg-transparent outline-none text-sm text-[#2b3437] placeholder:text-[#586064]/60"
      />
    </div>
  );
}

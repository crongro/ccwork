interface TagPanelProps {
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
}

export function TagPanel({ allTags, selectedTag, onSelectTag }: TagPanelProps) {
  if (allTags.length === 0) {
    return <p className="text-xs text-[#586064] px-1 py-[0.35rem]">태그 없음</p>;
  }

  return (
    <div className="flex flex-wrap gap-[0.7rem] px-1 pb-[1.4rem]">
      {allTags.map((tag) => {
        const isSelected = tag === selectedTag;
        return (
          <button
            key={tag}
            data-selected={isSelected ? 'true' : 'false'}
            onClick={() => onSelectTag(tag)}
            className={`text-xs rounded-full px-[0.7rem] py-[0.35rem] cursor-pointer transition-colors ${
              isSelected ? 'bg-[#2b3437] text-[#f8f9fa]' : 'bg-[#dbe4e7] text-[#586064]'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

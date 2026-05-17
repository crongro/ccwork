import { Note } from '../../types/note';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedTag: string | null;
}

export function NoteItem({ note, isSelected, onSelect, onDelete, selectedTag }: NoteItemProps) {
  const isTagHighlighted = selectedTag !== null && note.tags.includes(selectedTag);

  return (
    <div
      data-testid="note-item"
      data-tag-highlight={isTagHighlighted ? 'true' : undefined}
      onClick={() => onSelect(note.id)}
      className={`rounded-2xl p-4 cursor-pointer transition-colors ${
        isSelected ? 'bg-[#dbe4e7]' : 'bg-[#ffffff] hover:bg-[#f1f4f6]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">
          {note.title || '(제목 없음)'}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-muted-foreground hover:text-destructive text-xs shrink-0 transition-colors cursor-pointer"
        >
          삭제
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
        {note.content || '(내용 없음)'}
      </p>
      <p className="text-[10px] text-muted-foreground/70 mt-2">
        {new Date(note.updatedAt).toLocaleDateString('ko-KR')}
      </p>
      {note.tags.length > 0 && (
        <div data-testid="tag-badge-area" className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              data-testid={`badge-${tag}`}
              data-badge-highlight={selectedTag === tag ? 'true' : undefined}
              className={`text-xs rounded-full px-[0.7rem] py-[0.35rem] ${
                selectedTag === tag ? 'bg-[#0053dc] text-[#faf8ff]' : 'bg-[#dbe4e7] text-[#586064]'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

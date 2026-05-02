import { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { useTagInput } from '../hooks/useTagInput';
import { TagChipInput } from './TagChipInput';

interface NoteEditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}

export function NoteEditor({ selectedNoteId, isCreating, onDone }: NoteEditorProps) {
  const { notes, createNote, updateNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const { tags, input, setInput, removeTag, handleKeyDown } = useTagInput(selectedNote?.tags ?? []);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    } else if (isCreating) {
      setTitle('');
      setContent('');
    }
  }, [selectedNoteId, isCreating]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      if (isCreating) {
        await createNote(title, content);
      } else if (selectedNoteId) {
        await updateNote(selectedNoteId, { title, content, tags: [...tags] });
      }
      onDone();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!isCreating && !selectedNoteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <p className="text-5xl">📝</p>
          <p className="text-muted-foreground text-sm">노트를 선택하거나 새 노트를 만드세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl px-8 sm:px-12 py-8 shadow-[0_2px_12px_rgba(0,0,0,0.07)] max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6">
        {isCreating ? '새 노트' : '노트 편집'}
      </p>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full text-xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50 mb-4"
      />

      <div className="mb-4">
        <TagChipInput
          tags={tags}
          input={input}
          onInputChange={setInput}
          onKeyDown={handleKeyDown}
          onRemove={removeTag}
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용을 입력하세요..."
        rows={14}
        className="w-full text-base text-foreground/70 bg-transparent outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed"
      />

      <div className="flex gap-3 mt-6 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-card px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-75 transition-opacity disabled:opacity-40 cursor-pointer"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={onDone}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted-foreground/10 transition-colors cursor-pointer"
        >
          취소
        </button>
      </div>
    </div>
  );
}

import type { Note } from '../../types/note';

export function useNoteFilter(notes: Note[], query: string): Note[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return notes;
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(normalized) || n.content.toLowerCase().includes(normalized),
  );
}

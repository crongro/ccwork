import type { Note } from '../../types/note';

export function useTagFilter(
  notes: Note[],
  selectedTag: string | null,
): {
  allTags: string[];
  filteredNotes: Note[];
} {
  const allTags = [...new Set(notes.flatMap((n) => n.tags))];
  const filteredNotes =
    selectedTag === null ? notes : notes.filter((n) => n.tags.includes(selectedTag));

  return { allTags, filteredNotes };
}

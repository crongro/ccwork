import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTagFilter } from './useTagFilter';
import type { Note } from '../../types/note';

const makeNote = (id: string, tags: string[]): Note => ({
  id,
  title: `Note ${id}`,
  content: '',
  createdAt: '',
  updatedAt: '',
  tags,
});

describe('useTagFilter', () => {
  it('should return all notes as filteredNotes when selectedTag is null', () => {
    const notes = [makeNote('1', ['react']), makeNote('2', ['vue'])];
    const { result } = renderHook(() => useTagFilter(notes, null));

    expect(result.current.filteredNotes).toEqual(notes);
  });

  it('should return only notes containing selectedTag when selectedTag is set', () => {
    const notes = [
      makeNote('1', ['react']),
      makeNote('2', ['vue']),
      makeNote('3', ['react', 'ts']),
    ];
    const { result } = renderHook(() => useTagFilter(notes, 'react'));

    expect(result.current.filteredNotes).toEqual([notes[0], notes[2]]);
  });

  it('should return deduplicated allTags collected from all notes', () => {
    const notes = [makeNote('1', ['react', 'ts']), makeNote('2', ['react', 'vue'])];
    const { result } = renderHook(() => useTagFilter(notes, null));

    expect(result.current.allTags).toEqual(expect.arrayContaining(['react', 'ts', 'vue']));
    expect(result.current.allTags).toHaveLength(3);
  });

  it('should return empty allTags when all notes have empty tags[]', () => {
    const notes = [makeNote('1', []), makeNote('2', [])];
    const { result } = renderHook(() => useTagFilter(notes, null));

    expect(result.current.allTags).toEqual([]);
  });

  it('should return empty filteredNotes when selectedTag matches no note', () => {
    const notes = [makeNote('1', ['react']), makeNote('2', ['vue'])];
    const { result } = renderHook(() => useTagFilter(notes, 'unknown'));

    expect(result.current.filteredNotes).toEqual([]);
  });

  it('should handle notes with duplicate tags across multiple notes (dedup)', () => {
    const notes = [makeNote('1', ['react']), makeNote('2', ['react']), makeNote('3', ['react'])];
    const { result } = renderHook(() => useTagFilter(notes, null));

    expect(result.current.allTags).toEqual(['react']);
  });

  it('should return all notes when notes array is empty', () => {
    const { result } = renderHook(() => useTagFilter([], null));

    expect(result.current.filteredNotes).toEqual([]);
    expect(result.current.allTags).toEqual([]);
  });

  it('should not throw when selectedTag is a tag that exists in no note', () => {
    const notes = [makeNote('1', ['react'])];

    expect(() => renderHook(() => useTagFilter(notes, 'nonexistent'))).not.toThrow();
  });
});

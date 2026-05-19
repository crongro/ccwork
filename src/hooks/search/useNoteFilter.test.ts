import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNoteFilter } from './useNoteFilter';
import type { Note } from '../../types/note';

function makeNote(overrides: Partial<Note>): Note {
  return {
    id: 'id',
    title: '',
    content: '',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useNoteFilter', () => {
  describe('정상', () => {
    it('should return notes whose title includes query (case-insensitive)', () => {
      const notes = [
        makeNote({ id: '1', title: '회의록' }),
        makeNote({ id: '2', title: '쇼핑목록' }),
        makeNote({ id: '3', title: '독서노트' }),
      ];

      const { result } = renderHook(() => useNoteFilter(notes, '회의'));

      expect(result.current).toEqual([notes[0]]);
    });

    it('should return notes whose content includes query (case-insensitive)', () => {
      const notes = [makeNote({ id: '1', title: 'Note', content: 'TODO: 책 사기' })];

      const { result } = renderHook(() => useNoteFilter(notes, 'todo'));

      expect(result.current).toEqual([notes[0]]);
    });

    it('should match across both title and content fields', () => {
      const notes = [
        makeNote({ id: '1', title: 'apple', content: 'x' }),
        makeNote({ id: '2', title: 'x', content: 'apple pie' }),
        makeNote({ id: '3', title: 'x', content: 'x' }),
      ];

      const { result } = renderHook(() => useNoteFilter(notes, 'apple'));

      expect(result.current.map((n) => n.id)).toEqual(['1', '2']);
    });
  });

  describe('경계', () => {
    it('should return all notes when query is empty string', () => {
      const notes = [makeNote({ id: '1', title: 'a' }), makeNote({ id: '2', title: 'b' })];

      const { result } = renderHook(() => useNoteFilter(notes, ''));

      expect(result.current).toEqual(notes);
    });

    it('should return all notes when query is whitespace only', () => {
      const notes = [makeNote({ id: '1', title: 'a' }), makeNote({ id: '2', title: 'b' })];

      const { result } = renderHook(() => useNoteFilter(notes, '   '));

      expect(result.current).toEqual(notes);
    });

    it('should return empty array when notes is empty', () => {
      const { result } = renderHook(() => useNoteFilter([], 'anything'));

      expect(result.current).toEqual([]);
    });

    it('should return empty array when no note matches', () => {
      const notes = [makeNote({ id: '1', title: '회의록', content: 'meeting' })];

      const { result } = renderHook(() => useNoteFilter(notes, 'xyz'));

      expect(result.current).toEqual([]);
    });

    it('should trim query before matching', () => {
      const notes = [makeNote({ id: '1', title: '회의록' })];

      const { result } = renderHook(() => useNoteFilter(notes, '  회의  '));

      expect(result.current).toEqual([notes[0]]);
    });
  });

  describe('예외', () => {
    it('should not throw when notes contain empty title or content', () => {
      const notes = [
        makeNote({ id: '1', title: '', content: '' }),
        makeNote({ id: '2', title: 'hello', content: '' }),
      ];

      const { result } = renderHook(() => useNoteFilter(notes, 'hello'));

      expect(result.current).toEqual([notes[1]]);
    });
  });
});

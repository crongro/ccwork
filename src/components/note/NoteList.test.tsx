import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteList } from './NoteList';
import type { Note } from '../../types/note';

const deleteNote = vi.fn();
const contextNote = {
  id: 'ctx-1',
  title: 'Context Note',
  content: '',
  createdAt: '',
  updatedAt: '',
  tags: [],
};

vi.mock('../../context/NotesContext', () => ({
  useNotes: () => ({
    notes: [contextNote],
    loading: false,
    error: null,
    deleteNote,
  }),
}));

const makeNote = (id: string): Note => ({
  id,
  title: `Note ${id}`,
  content: `Content ${id}`,
  createdAt: '',
  updatedAt: '',
  tags: [],
});

describe('NoteList', () => {
  it('should render notes passed via notes prop (not from context)', () => {
    const notes = [makeNote('1'), makeNote('2')];

    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} notes={notes} />);

    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });

  it('should show empty state when notes prop is empty array', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} notes={[]} />);

    expect(screen.getByText('노트가 없습니다')).toBeInTheDocument();
  });
});

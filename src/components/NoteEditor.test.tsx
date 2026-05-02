import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../types/note';

const updateNote = vi.fn();
const createNote = vi.fn();
const deleteNote = vi.fn();
let mockNotes: Note[] = [];

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: mockNotes,
    loading: false,
    error: null,
    createNote,
    updateNote,
    deleteNote,
  }),
}));

describe('NoteEditor', () => {
  beforeEach(() => {
    updateNote.mockReset();
    createNote.mockReset();
    deleteNote.mockReset();
    mockNotes = [];
  });

  it('should render TagChipInput between title and content textarea when editing a note', () => {
    mockNotes = [
      {
        id: 'n1',
        title: '제목',
        content: '본문',
        createdAt: '',
        updatedAt: '',
        tags: ['work'],
      },
    ];

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);

    const title = screen.getByPlaceholderText('제목');
    const content = screen.getByPlaceholderText('내용을 입력하세요...');
    const chip = screen.getByText('work');

    expect(title.compareDocumentPosition(chip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(chip.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should include tags in updateNote payload when save button is clicked', async () => {
    mockNotes = [
      {
        id: 'n1',
        title: '제목',
        content: '본문',
        createdAt: '',
        updatedAt: '',
        tags: ['work', 'study'],
      },
    ];
    updateNote.mockResolvedValue(undefined);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNote).toHaveBeenCalledWith(
      'n1',
      expect.objectContaining({ tags: ['work', 'study'] }),
    );
  });

  it('should place TagChipInput as immediate next sibling of title input with no other input/textarea/button between', () => {
    mockNotes = [
      {
        id: 'n1',
        title: '제목',
        content: '본문',
        createdAt: '',
        updatedAt: '',
        tags: ['work'],
      },
    ];

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);

    const title = screen.getByPlaceholderText('제목');
    const tagInput = screen.getByPlaceholderText('태그 추가');

    expect(title.nextElementSibling).toContainElement(tagInput);
  });

  it('should include typed tag in updateNote payload when user types work and presses Enter then clicks save', async () => {
    mockNotes = [
      {
        id: 'n1',
        title: '제목',
        content: '본문',
        createdAt: '',
        updatedAt: '',
        tags: [],
      },
    ];
    updateNote.mockResolvedValue(undefined);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);

    const tagInput = screen.getByPlaceholderText('태그 추가');
    await userEvent.type(tagInput, 'work{Enter}');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNote).toHaveBeenCalledWith('n1', expect.objectContaining({ tags: ['work'] }));
  });

  it('should preserve insertion order in updateNote payload when typing study on note with existing work then save', async () => {
    mockNotes = [
      {
        id: 'n1',
        title: '제목',
        content: '본문',
        createdAt: '',
        updatedAt: '',
        tags: ['work'],
      },
    ];
    updateNote.mockResolvedValue(undefined);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);

    const tagInput = screen.getByPlaceholderText('태그 추가');
    await userEvent.type(tagInput, 'study{Enter}');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNote).toHaveBeenCalledWith(
      'n1',
      expect.objectContaining({ tags: ['work', 'study'] }),
    );
  });

  it('should not change tags in updateNote payload when Enter is pressed on empty input then save', async () => {
    mockNotes = [
      {
        id: 'n1',
        title: '제목',
        content: '본문',
        createdAt: '',
        updatedAt: '',
        tags: ['work'],
      },
    ];
    updateNote.mockResolvedValue(undefined);

    render(<NoteEditor selectedNoteId="n1" isCreating={false} onDone={vi.fn()} />);

    const tagInput = screen.getByPlaceholderText('태그 추가');
    await userEvent.type(tagInput, '{Enter}');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNote).toHaveBeenCalledWith('n1', expect.objectContaining({ tags: ['work'] }));
  });

  it('should save with tags: [] payload when no tag has been added (legacy note)', async () => {
    mockNotes = [
      {
        id: 'legacy',
        title: '오래된 노트',
        content: '내용',
        createdAt: '',
        updatedAt: '',
        tags: [],
      },
    ];
    updateNote.mockResolvedValue(undefined);

    render(<NoteEditor selectedNoteId="legacy" isCreating={false} onDone={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNote).toHaveBeenCalledWith('legacy', expect.objectContaining({ tags: [] }));
  });
});

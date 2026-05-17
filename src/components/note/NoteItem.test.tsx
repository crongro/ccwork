import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteItem } from './NoteItem';
import type { Note } from '../../types/note';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: '1',
  title: 'Test Note',
  content: 'Test Content',
  createdAt: '',
  updatedAt: '',
  tags: [],
  ...overrides,
});

describe('NoteItem', () => {
  it('should render tag badges when note.tags is non-empty', () => {
    const note = makeNote({ tags: ['work'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('should render all tags as individual badge elements', () => {
    const note = makeNote({ tags: ['work', 'study', 'react'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('study')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('should apply highlight style to card when selectedTag matches one of note.tags', () => {
    const note = makeNote({ tags: ['work', 'study'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag="work"
      />,
    );

    expect(screen.getByTestId('note-item')).toHaveAttribute('data-tag-highlight', 'true');
  });

  it('should apply highlight style only to the matched tag badge when selectedTag is set', () => {
    const note = makeNote({ tags: ['work', 'study'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag="work"
      />,
    );

    expect(screen.getByTestId('badge-work')).toHaveAttribute('data-badge-highlight', 'true');
  });

  it('should keep non-selected tag badges in default style when selectedTag is set', () => {
    const note = makeNote({ tags: ['work', 'study'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag="work"
      />,
    );

    expect(screen.getByTestId('badge-study')).not.toHaveAttribute('data-badge-highlight', 'true');
  });

  it('should not render tag badge area when note.tags is empty array', () => {
    const note = makeNote({ tags: [] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    expect(screen.queryByTestId('tag-badge-area')).not.toBeInTheDocument();
  });

  it('should not apply card highlight when selectedTag is null', () => {
    const note = makeNote({ tags: ['work'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    expect(screen.getByTestId('note-item')).not.toHaveAttribute('data-tag-highlight', 'true');
  });

  it('should not apply card highlight when selectedTag does not match any of note.tags', () => {
    const note = makeNote({ tags: ['work'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag="study"
      />,
    );

    expect(screen.getByTestId('note-item')).not.toHaveAttribute('data-tag-highlight', 'true');
  });

  it('should not highlight any badge when selectedTag is null', () => {
    const note = makeNote({ tags: ['work', 'study'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    expect(screen.getByTestId('badge-work')).not.toHaveAttribute('data-badge-highlight', 'true');
    expect(screen.getByTestId('badge-study')).not.toHaveAttribute('data-badge-highlight', 'true');
  });

  it('should render all badges in default style when selectedTag matches none of note.tags', () => {
    const note = makeNote({ tags: ['work', 'study'] });

    render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag="react"
      />,
    );

    expect(screen.getByTestId('badge-work')).not.toHaveAttribute('data-badge-highlight', 'true');
    expect(screen.getByTestId('badge-study')).not.toHaveAttribute('data-badge-highlight', 'true');
  });

  it('should render tag badges independently of isSelected (note selection state does not affect tag badge styles)', () => {
    const note = makeNote({ tags: ['work'] });

    const { rerender } = render(
      <NoteItem
        note={note}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    const badgeNotSelected = screen.getByTestId('badge-work').getAttribute('data-badge-highlight');

    rerender(
      <NoteItem
        note={note}
        isSelected={true}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        selectedTag={null}
      />,
    );

    const badgeSelected = screen.getByTestId('badge-work').getAttribute('data-badge-highlight');

    expect(badgeNotSelected).toEqual(badgeSelected);
  });
});

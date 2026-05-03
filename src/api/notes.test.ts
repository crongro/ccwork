import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as notesApi from './notes';
import { fetchNotes } from './notes';

describe('fetchNotes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should preserve tags field when API response includes it', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: '1',
            title: 't',
            content: 'c',
            createdAt: '',
            updatedAt: '',
            tags: ['work', 'study'],
          },
        ]),
        { status: 200 },
      ),
    );

    const notes = await fetchNotes();

    expect(notes[0].tags).toEqual(['work', 'study']);
  });

  it('should default tags to [] when API response omits the field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([{ id: '1', title: 't', content: 'c', createdAt: '', updatedAt: '' }]),
        { status: 200 },
      ),
    );

    const notes = await fetchNotes();

    expect(notes[0].tags).toEqual([]);
  });
});

describe('notes module structure', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should set updatedAt internally when updateNote is called (no tag-only helper)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '1',
          title: 't',
          content: 'c',
          createdAt: '',
          updatedAt: '',
          tags: [],
        }),
        { status: 200 },
      ),
    );

    await notesApi.updateNote('1', { title: 'new' });

    const requestInit = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);
    expect(body).toHaveProperty('updatedAt');
    expect(typeof body.updatedAt).toBe('string');
  });

  it('should not export any tag-specific API helper when notes module is loaded', () => {
    const exportedNames = Object.keys(notesApi);

    expect(exportedNames).not.toContain('addTag');
    expect(exportedNames).not.toContain('removeTag');
    expect(exportedNames.filter((n) => /^tag/i.test(n))).toEqual([]);
  });
});

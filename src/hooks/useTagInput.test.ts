import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

describe('useTagInput', () => {
  it('should expose tags, input, setInput, commit, handleKeyDown when initialized', () => {
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current).toMatchObject({
      tags: expect.any(Array),
      input: expect.any(String),
      setInput: expect.any(Function),
      commit: expect.any(Function),
      handleKeyDown: expect.any(Function),
    });
  });

  it('should initialize tags from initialTags argument', () => {
    const { result } = renderHook(() => useTagInput(['work', 'study']));

    expect(result.current.tags).toEqual(['work', 'study']);
  });

  it('should initialize input as empty string', () => {
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current.input).toBe('');
  });

  it('should expose removeTag when initialized', () => {
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current.removeTag).toEqual(expect.any(Function));
  });

  it('should expose isFull in returned object when initialized with options', () => {
    const { result } = renderHook(() => useTagInput([], { maxTags: 3, maxLen: 5 }));

    expect(result.current).toMatchObject({ isFull: expect.any(Boolean) });
  });

  it('should not expose setTags in returned object when initialized', () => {
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current).not.toHaveProperty('setTags');
  });

  describe('isFull', () => {
    it('should be false when tags count is below maxTags', () => {
      const { result } = renderHook(() => useTagInput(['a'], { maxTags: 3 }));

      expect(result.current.isFull).toBe(false);
    });

    it('should be true when tags count equals maxTags', () => {
      const { result } = renderHook(() => useTagInput(['a', 'b', 'c'], { maxTags: 3 }));

      expect(result.current.isFull).toBe(true);
    });

    it('should become false after removeTag is called on a full tag list', () => {
      const { result } = renderHook(() => useTagInput(['a', 'b', 'c'], { maxTags: 3 }));

      act(() => result.current.removeTag('a'));

      expect(result.current.isFull).toBe(false);
    });
  });

  describe('setInput', () => {
    it('should update input when called', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('hello'));

      expect(result.current.input).toBe('hello');
    });

    it('should update input when value length is within maxLen', () => {
      const { result } = renderHook(() => useTagInput([], { maxLen: 5 }));

      act(() => result.current.setInput('abc'));

      expect(result.current.input).toBe('abc');
    });

    it('should update input when value length equals maxLen exactly', () => {
      const { result } = renderHook(() => useTagInput([], { maxLen: 5 }));

      act(() => result.current.setInput('abcde'));

      expect(result.current.input).toBe('abcde');
    });

    it('should not update input when value length exceeds maxLen', () => {
      const { result } = renderHook(() => useTagInput([], { maxLen: 5 }));

      act(() => result.current.setInput('abcdef'));

      expect(result.current.input).toBe('');
    });
  });

  describe('commit', () => {
    it('should add trimmed input to tags and reset input when input is non-empty', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('work'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work']);
      expect(result.current.input).toBe('');
    });

    it('should preserve insertion order when committed multiple times', () => {
      const { result } = renderHook(() => useTagInput(['work']));

      act(() => result.current.setInput('study'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work', 'study']);
    });

    it('should add first tag when initial tags is empty', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('first'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['first']);
    });

    it('should trim leading and trailing whitespace from input', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('  work  '));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work']);
    });

    it('should not change tags when input is empty', () => {
      const { result } = renderHook(() => useTagInput(['existing']));

      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['existing']);
    });

    it('should reset input to empty string but not change tags when input is whitespace only', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('   '));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual([]);
      expect(result.current.input).toBe('');
    });

    it('should add tag when input does not match any existing tag case-insensitively', () => {
      const { result } = renderHook(() => useTagInput(['work']));

      act(() => result.current.setInput('study'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work', 'study']);
      expect(result.current.input).toBe('');
    });

    it('should not add tag and should clear input when input is same-case duplicate of existing tag', () => {
      const { result } = renderHook(() => useTagInput(['work']));

      act(() => result.current.setInput('work'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work']);
      expect(result.current.input).toBe('');
    });

    it('should not add tag and should clear input when input is different-case duplicate of existing tag', () => {
      const { result } = renderHook(() => useTagInput(['work']));

      act(() => result.current.setInput('Work'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work']);
      expect(result.current.input).toBe('');
    });

    it('should not change tags or input when isFull is true', () => {
      const { result } = renderHook(() => useTagInput(['a', 'b', 'c'], { maxTags: 3 }));

      act(() => result.current.setInput('new'));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['a', 'b', 'c']);
      expect(result.current.input).toBe('new');
    });
  });

  describe('removeTag', () => {
    it('should remove the given tag from tags when it exists', () => {
      const { result } = renderHook(() => useTagInput(['work', 'study', 'idea']));

      act(() => result.current.removeTag('study'));

      expect(result.current.tags).toEqual(['work', 'idea']);
    });

    it('should preserve order of remaining tags when removing a middle tag', () => {
      const { result } = renderHook(() => useTagInput(['a', 'b', 'c', 'd']));

      act(() => result.current.removeTag('b'));

      expect(result.current.tags).toEqual(['a', 'c', 'd']);
    });

    it('should leave tags as [] when removing the last remaining tag', () => {
      const { result } = renderHook(() => useTagInput(['only']));

      act(() => result.current.removeTag('only'));

      expect(result.current.tags).toEqual([]);
    });

    it('should be a no-op without throwing when tag is not in tags', () => {
      const { result } = renderHook(() => useTagInput(['work']));

      expect(() => {
        act(() => result.current.removeTag('nonexistent'));
      }).not.toThrow();
      expect(result.current.tags).toEqual(['work']);
    });
  });

  describe('handleKeyDown', () => {
    it('should commit current input to tags when key is Enter', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('work'));
      act(() => {
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.tags).toEqual(['work']);
      expect(result.current.input).toBe('');
    });

    it.each([['a'], ['Backspace']])('should not commit when key is %s', (key) => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('work'));
      act(() => {
        result.current.handleKeyDown({
          key,
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.tags).toEqual([]);
      expect(result.current.input).toBe('work');
    });

    it('should remove the last tag when Backspace is pressed and input is empty and tags is non-empty', () => {
      const { result } = renderHook(() => useTagInput(['work', 'study']));

      act(() => {
        result.current.handleKeyDown({
          key: 'Backspace',
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.tags).toEqual(['work']);
    });

    it('should be a no-op when Backspace is pressed and tags is empty and input is empty', () => {
      const { result } = renderHook(() => useTagInput([]));

      expect(() => {
        act(() => {
          result.current.handleKeyDown({
            key: 'Backspace',
            preventDefault: () => {},
          } as React.KeyboardEvent<HTMLInputElement>);
        });
      }).not.toThrow();
      expect(result.current.tags).toEqual([]);
      expect(result.current.input).toBe('');
    });

    it('should not change tags when Backspace is pressed and input is non-empty', () => {
      const { result } = renderHook(() => useTagInput(['work']));

      act(() => result.current.setInput('hel'));
      act(() => {
        result.current.handleKeyDown({
          key: 'Backspace',
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.tags).toEqual(['work']);
    });

    it('should not call preventDefault when Backspace is pressed and input is non-empty', () => {
      const { result } = renderHook(() => useTagInput(['work']));
      const preventDefault = vi.fn();

      act(() => result.current.setInput('hel'));
      act(() => {
        result.current.handleKeyDown({
          key: 'Backspace',
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(preventDefault).not.toHaveBeenCalled();
    });

    it.each([['a'], ['Delete'], ['ArrowLeft']])(
      'should not remove the last tag when key is %s and input is empty',
      (key) => {
        const { result } = renderHook(() => useTagInput(['work']));

        act(() => {
          result.current.handleKeyDown({
            key,
            preventDefault: () => {},
          } as React.KeyboardEvent<HTMLInputElement>);
        });

        expect(result.current.tags).toEqual(['work']);
      },
    );

    it('should commit current input to tags when comma key is pressed', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('work'));
      act(() => {
        result.current.handleKeyDown({
          key: ',',
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.tags).toEqual(['work']);
    });

    it('should clear input when comma key is pressed and input is non-empty', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('work'));
      act(() => {
        result.current.handleKeyDown({
          key: ',',
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.input).toBe('');
    });

    it('should not add tag when comma is pressed and input is empty', () => {
      const { result } = renderHook(() => useTagInput(['existing']));

      act(() => {
        result.current.handleKeyDown({
          key: ',',
          preventDefault: () => {},
        } as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.tags).toEqual(['existing']);
    });

    it('should call preventDefault when comma key is pressed', () => {
      const { result } = renderHook(() => useTagInput([]));
      const preventDefault = vi.fn();

      act(() => result.current.setInput('work'));
      act(() => {
        result.current.handleKeyDown({
          key: ',',
          preventDefault,
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should replace tags with nextTags when called', () => {
      const { result } = renderHook(() => useTagInput(['old']));

      act(() => result.current.reset(['alpha', 'beta']));

      expect(result.current.tags).toEqual(['alpha', 'beta']);
    });

    it('should reset input to empty string when called', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('draft'));
      act(() => result.current.reset(['alpha']));

      expect(result.current.input).toBe('');
    });

    it('should set tags to [] when called with empty array', () => {
      const { result } = renderHook(() => useTagInput(['work', 'study']));

      act(() => result.current.reset([]));

      expect(result.current.tags).toEqual([]);
    });
  });

  it('should expose reset in returned object when initialized', () => {
    const { result } = renderHook(() => useTagInput([]));

    expect(result.current.reset).toEqual(expect.any(Function));
  });
});

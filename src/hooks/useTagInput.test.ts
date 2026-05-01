import { describe, it, expect } from 'vitest';
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

  describe('setInput', () => {
    it('should update input when called', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('hello'));

      expect(result.current.input).toBe('hello');
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

    it.each([['a'], ['Backspace'], [',']])('should not commit when key is %s', (key) => {
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
  });
});

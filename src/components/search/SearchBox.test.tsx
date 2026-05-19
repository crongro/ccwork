import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('정상', () => {
    it('should render input element with placeholder text', () => {
      render(<SearchBox onChange={vi.fn()} placeholder="검색" />);

      expect(screen.getByPlaceholderText('검색')).toBeInTheDocument();
    });

    it('should call onChange with input value after debounce delay', () => {
      const onChange = vi.fn();
      render(<SearchBox onChange={onChange} debounceMs={200} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'hi' } });
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onChange).toHaveBeenCalledWith('hi');
    });
  });

  describe('경계', () => {
    it('should debounce rapid input and call onChange only once with latest value', () => {
      const onChange = vi.fn();
      render(<SearchBox onChange={onChange} debounceMs={200} />);

      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'a' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.change(input, { target: { value: 'ab' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.change(input, { target: { value: 'abc' } });
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith('abc');
    });

    it('should clear pending timeout on unmount', () => {
      const onChange = vi.fn();
      const { unmount } = render(<SearchBox onChange={onChange} debounceMs={200} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'x' } });
      unmount();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('예외', () => {
    it('should not call onChange before debounce delay elapses', () => {
      const onChange = vi.fn();
      render(<SearchBox onChange={onChange} debounceMs={200} />);

      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'x' } });
      act(() => {
        vi.advanceTimersByTime(199);
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

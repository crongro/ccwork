import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagPanel } from './TagPanel';

describe('TagPanel', () => {
  it('should render a chip for each tag in allTags', () => {
    render(<TagPanel allTags={['react', 'vue']} selectedTag={null} onSelectTag={vi.fn()} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('should call onSelectTag with the tag name when a chip is clicked', async () => {
    const onSelectTag = vi.fn();
    render(<TagPanel allTags={['react']} selectedTag={null} onSelectTag={onSelectTag} />);

    await userEvent.click(screen.getByText('react'));

    expect(onSelectTag).toHaveBeenCalledWith('react');
  });

  it('should visually mark the selectedTag chip as active', () => {
    render(<TagPanel allTags={['react', 'vue']} selectedTag="react" onSelectTag={vi.fn()} />);

    const reactChip = screen.getByText('react').closest('[data-selected="true"]');
    expect(reactChip).toBeInTheDocument();
  });

  it('should render "태그 없음" when allTags is empty', () => {
    render(<TagPanel allTags={[]} selectedTag={null} onSelectTag={vi.fn()} />);

    expect(screen.getByText('태그 없음')).toBeInTheDocument();
  });

  it('should call onSelectTag once per click (not bubble)', async () => {
    const onSelectTag = vi.fn();
    render(<TagPanel allTags={['react']} selectedTag={null} onSelectTag={onSelectTag} />);

    await userEvent.click(screen.getByText('react'));

    expect(onSelectTag).toHaveBeenCalledTimes(1);
  });
});

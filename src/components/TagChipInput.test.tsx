import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagChipInput } from './TagChipInput';

describe('TagChipInput', () => {
  it('should render each tag as a chip when tags is non-empty', () => {
    render(
      <TagChipInput
        tags={['work', 'study']}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should call onInputChange with new value when user types', async () => {
    const onInputChange = vi.fn();
    render(<TagChipInput tags={[]} input="" onInputChange={onInputChange} onKeyDown={vi.fn()} />);

    await userEvent.type(screen.getByRole('textbox'), 'a');

    expect(onInputChange).toHaveBeenCalledWith('a');
  });

  it('should call onKeyDown with KeyboardEvent when user presses a key', async () => {
    const onKeyDown = vi.fn();
    render(<TagChipInput tags={[]} input="" onInputChange={vi.fn()} onKeyDown={onKeyDown} />);

    await userEvent.type(screen.getByRole('textbox'), '{Enter}');

    expect(onKeyDown).toHaveBeenCalled();
    expect(onKeyDown.mock.calls[0][0]).toMatchObject({ key: 'Enter' });
  });

  it('should render no chip when tags is empty', () => {
    render(<TagChipInput tags={[]} input="" onInputChange={vi.fn()} onKeyDown={vi.fn()} />);

    expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
  });
});

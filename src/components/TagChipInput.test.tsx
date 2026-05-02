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
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should call onInputChange with new value when user types', async () => {
    const onInputChange = vi.fn();
    render(
      <TagChipInput
        tags={[]}
        input=""
        onInputChange={onInputChange}
        onKeyDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByRole('textbox'), 'a');

    expect(onInputChange).toHaveBeenCalledWith('a');
  });

  it('should call onKeyDown with KeyboardEvent when user presses a key', async () => {
    const onKeyDown = vi.fn();
    render(
      <TagChipInput
        tags={[]}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={onKeyDown}
        onRemove={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByRole('textbox'), '{Enter}');

    expect(onKeyDown).toHaveBeenCalled();
    expect(onKeyDown.mock.calls[0][0]).toMatchObject({ key: 'Enter' });
  });

  it('should render no chip when tags is empty', () => {
    render(
      <TagChipInput
        tags={[]}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
  });

  it('should render a remove button with aria-label "태그 삭제" for each chip', () => {
    render(
      <TagChipInput
        tags={['work', 'study']}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', { name: '태그 삭제' })).toHaveLength(2);
  });

  it('should call onRemove with the tag string when its remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(
      <TagChipInput
        tags={['work', 'study']}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
        onRemove={onRemove}
      />,
    );

    const studyChip = screen.getByText('study').closest('[data-testid="tag-chip"]');
    const removeBtn = studyChip!.querySelector(
      'button[aria-label="태그 삭제"]',
    ) as HTMLButtonElement;
    await userEvent.click(removeBtn);

    expect(onRemove).toHaveBeenCalledWith('study');
  });

  it('should hide the remove button by default and reveal it on chip hover via CSS classes', () => {
    render(
      <TagChipInput
        tags={['work']}
        input=""
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const removeBtn = screen.getByRole('button', { name: '태그 삭제' });
    const className = removeBtn.className;

    expect(className).toMatch(/opacity-0/);
    expect(className).toMatch(/group-hover:opacity-100/);
  });

  it('should render input as disabled when isFull is true', () => {
    render(
      <TagChipInput
        tags={[]}
        input=""
        isFull={true}
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should render input as enabled when isFull is false', () => {
    render(
      <TagChipInput
        tags={[]}
        input=""
        isFull={false}
        onInputChange={vi.fn()}
        onKeyDown={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });
});

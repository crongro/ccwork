import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001';

async function createTestNote(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const res = await request.post(`${API}/notes`, {
    data: {
      title: `e2e-filter-${suffix}`,
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    },
  });
  return res.json() as Promise<{ id: string; title: string; tags: string[] }>;
}

function uniqueTag(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

test.describe('태그 필터', () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request }) => {
    await Promise.all(
      createdIds.splice(0).map((id) => request.delete(`${API}/notes/${id}`).catch(() => {})),
    );
  });

  // US-1: 사이드바에 사용 중인 태그 칩이 노출된다
  test('노트에 태그가 있을 때 사이드바에 해당 태그 칩이 표시된다', async ({ page, request }) => {
    const tagA = uniqueTag('fa');
    const note = await createTestNote(request, { tags: [tagA] });
    createdIds.push(note.id);

    await page.goto('/');

    const tagChip = page.getByRole('button', { name: tagA, exact: true });
    await expect(tagChip).toBeVisible();
  });

  // US-1: 태그 클릭 → 해당 태그가 달린 노트만 표시 (태그 없는 노트는 숨김)
  test('태그 칩을 클릭하면 해당 태그가 달린 노트만 목록에 표시된다', async ({ page, request }) => {
    const tagA = uniqueTag('fa');
    const withTag = await createTestNote(request, { tags: [tagA] });
    const withoutTag = await createTestNote(request);
    createdIds.push(withTag.id, withoutTag.id);

    await page.goto('/');

    const noteList = page.getByTestId('note-list');
    await expect(noteList.getByText(withTag.title)).toBeVisible();
    await expect(noteList.getByText(withoutTag.title)).toBeVisible();

    await page.getByRole('button', { name: tagA, exact: true }).click();

    await expect(noteList.getByText(withTag.title)).toBeVisible();
    await expect(noteList.getByText(withoutTag.title)).toHaveCount(0);
  });

  // US-1: 선택된 태그 재클릭 → 필터 해제, 전체 노트 다시 표시
  test('선택된 태그 칩을 다시 클릭하면 필터가 해제되어 전체 노트가 보인다', async ({
    page,
    request,
  }) => {
    const tagA = uniqueTag('fa');
    const withTag = await createTestNote(request, { tags: [tagA] });
    const withoutTag = await createTestNote(request);
    createdIds.push(withTag.id, withoutTag.id);

    await page.goto('/');
    const chip = page.getByRole('button', { name: tagA, exact: true });

    await chip.click();
    await expect(chip).toHaveAttribute('data-selected', 'true');
    await expect(page.getByTestId('note-list').getByText(withoutTag.title)).toHaveCount(0);

    await chip.click();
    await expect(chip).toHaveAttribute('data-selected', 'false');
    await expect(page.getByTestId('note-list').getByText(withTag.title)).toBeVisible();
    await expect(page.getByTestId('note-list').getByText(withoutTag.title)).toBeVisible();
  });

  // US-2: 선택된 태그가 달린 카드 강조 + 카드 내 해당 뱃지만 하이라이트
  test('태그 필터링 중일 때 일치 카드와 카드 내 해당 뱃지가 강조된다', async ({
    page,
    request,
  }) => {
    const tagA = uniqueTag('fa');
    const tagB = uniqueTag('fb');
    const note = await createTestNote(request, { tags: [tagA, tagB] });
    createdIds.push(note.id);

    await page.goto('/');

    await page.getByRole('button', { name: tagA, exact: true }).click();

    const card = page
      .getByTestId('note-list')
      .getByTestId('note-item')
      .filter({ hasText: note.title });
    await expect(card).toHaveAttribute('data-tag-highlight', 'true');

    await expect(card.getByTestId(`badge-${tagA}`)).toHaveAttribute('data-badge-highlight', 'true');
    await expect(card.getByTestId(`badge-${tagB}`)).not.toHaveAttribute(
      'data-badge-highlight',
      'true',
    );
  });
});

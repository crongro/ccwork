import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001';

async function createTestNote(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const res = await request.post(`${API}/notes`, {
    data: {
      title: `e2e-note-${suffix}`,
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    },
  });
  return res.json() as Promise<{ id: string; title: string; tags: string[] }>;
}

test.describe('태그', () => {
  let noteId: string;
  let noteTitle: string;

  test.beforeEach(async ({ request }) => {
    const note = await createTestNote(request);
    noteId = note.id;
    noteTitle = note.title;
  });

  test.afterEach(async ({ request }) => {
    await request.delete(`${API}/notes/${noteId}`).catch(() => {});
  });

  // US-3: 태그 입력 UI 위치
  test('노트 선택 시 제목 아래 태그 입력 영역이 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click();

    await expect(page.getByTestId('tag-chip-input')).toBeVisible();
  });

  // US-3: 기존 태그 로드
  test('기존 태그가 있는 노트를 선택하면 태그 칩이 표시된다', async ({ page, request }) => {
    const tagNote = await createTestNote(request, { tags: ['react', 'typescript'] });

    try {
      await page.goto('/');
      await page.getByText(tagNote.title).first().click();

      await expect(page.getByTestId('tag-chip')).toHaveCount(2);
      await expect(page.getByTestId('tag-chip').first()).toContainText('react');
    } finally {
      await request.delete(`${API}/notes/${tagNote.id}`).catch(() => {});
    }
  });

  // US-1: Enter로 태그 추가
  test('Enter 키로 태그를 추가하면 칩이 생성되고 입력창이 비워진다', async ({ page }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click();

    const input = page.getByTestId('tag-chip-input');
    await input.fill('work');
    await input.press('Enter');

    await expect(page.getByTestId('tag-chip')).toHaveCount(1);
    await expect(page.getByTestId('tag-chip').first()).toContainText('work');
    await expect(input).toHaveValue('');
  });

  // US-1: 쉼표로 태그 추가
  test('쉼표(,) 키로 태그를 추가하면 칩이 생성되고 쉼표는 포함되지 않는다', async ({ page }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click();

    const input = page.getByTestId('tag-chip-input');
    await input.fill('study');
    await input.press(',');

    await expect(page.getByTestId('tag-chip')).toHaveCount(1);
    await expect(page.getByTestId('tag-chip').first()).toContainText('study');
    await expect(page.getByTestId('tag-chip').first()).not.toContainText(',');
    await expect(input).toHaveValue('');
  });

  // US-2: hover × 버튼 + 삭제
  test('칩에 hover하면 × 버튼이 나타나고 클릭하면 태그가 삭제된다', async ({ page }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click();

    const input = page.getByTestId('tag-chip-input');
    await input.fill('work');
    await input.press('Enter');
    await expect(page.getByTestId('tag-chip')).toHaveCount(1);

    const chip = page.getByTestId('tag-chip').first();
    const removeBtn = chip.getByRole('button', { name: '태그 삭제' });

    // 기본 상태: × 버튼 opacity-0 (Playwright는 opacity 미체크, CSS 직접 단언)
    await expect(removeBtn).toHaveCSS('opacity', '0');

    // hover 후: × 버튼 opacity-1
    await chip.hover();
    await expect(removeBtn).toHaveCSS('opacity', '1');

    // × 클릭 → 칩 제거
    await removeBtn.click();
    await expect(page.getByTestId('tag-chip')).toHaveCount(0);
  });

  // US-2: Backspace 삭제
  test('빈 입력창에서 Backspace를 누르면 마지막 칩이 삭제된다', async ({ page }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click();

    const input = page.getByTestId('tag-chip-input');
    await input.fill('work');
    await input.press('Enter');
    await input.fill('study');
    await input.press('Enter');
    await expect(page.getByTestId('tag-chip')).toHaveCount(2);

    // 빈 입력창에서 Backspace → 마지막 칩(study) 삭제
    await input.press('Backspace');

    await expect(page.getByTestId('tag-chip')).toHaveCount(1);
    await expect(page.getByTestId('tag-chip').first()).toContainText('work');
  });

  // US-4: 저장 + 영속성
  test('태그를 추가하고 저장하면 페이지 재로드 후에도 태그가 유지된다', async ({
    page,
    request,
  }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click();

    const input = page.getByTestId('tag-chip-input');
    await input.fill('react');
    await input.press('Enter');
    await expect(page.getByTestId('tag-chip')).toHaveCount(1);

    // 저장 - PATCH 완료 대기
    await page.getByRole('button', { name: '저장' }).click();
    await page.waitForResponse(
      (res) => res.url().includes('/notes/') && res.request().method() === 'PATCH',
    );

    // 페이지 새로고침 → 모든 로컬 상태 초기화 + JSON Server 재조회
    await page.reload();
    await page.getByText(noteTitle).first().click();

    await expect(page.getByTestId('tag-chip')).toHaveCount(1);
    await expect(page.getByTestId('tag-chip').first()).toContainText('react');

    // API 레벨 영속성 확인
    const saved = await request.get(`${API}/notes/${noteId}`);
    expect((await saved.json()).tags).toContain('react');
  });
});

import { test, expect } from '@playwright/test';

test('노트 앱 로드', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/notes/i);
});

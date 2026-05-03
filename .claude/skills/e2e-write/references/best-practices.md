# E2E Best Practices (Playwright)

## 테스트 격리 원칙

### JSON Server 데이터 격리

E2E 테스트는 `db.json`을 직접 공유하므로 각 테스트가 독립적인 데이터를 사용해야 한다.

```typescript
// ✅ request fixture로 테스트 전용 노트 생성/삭제
test.beforeEach(async ({ request }) => {
  const note = await request.post('http://localhost:3001/notes', { data: { ... } });
  noteId = (await note.json()).id;
});
test.afterEach(async ({ request }) => {
  await request.delete(`http://localhost:3001/notes/${noteId}`).catch(() => {});
});

// ❌ 실제 운영 데이터(db.json 고정 ID)에 의존
await page.getByText('회의록').click(); // db.json에 해당 노트가 없으면 실패
```

### 테스트 독립성

```typescript
// ✅ 각 test()는 이전 test() 상태에 의존하지 않음
// ✅ beforeEach에서 상태를 완전히 초기화
// ❌ test() 간 전역 변수로 상태 공유하며 순서 의존
```

## 셀렉터 전략

### 우선순위 (높음 → 낮음)

| 우선순위 | 방법                          | 예시                                            |
| -------- | ----------------------------- | ----------------------------------------------- |
| 1        | `getByRole` + accessible name | `getByRole('button', { name: '저장' })`         |
| 2        | `getByLabel`                  | `getByLabel('제목')`                            |
| 3        | `getByPlaceholder`            | `getByPlaceholder('태그 입력 후 Enter')`        |
| 4        | `getByText` (정확 일치)       | `getByText('E2E 테스트 노트', { exact: true })` |
| 5        | `getByTestId`                 | `getByTestId('tag-chip')`                       |
| 6        | CSS locator                   | `locator('.chip-container > button')`           |

### data-testid 사용 시점

컴포넌트에 이미 존재하는 `data-testid`만 사용한다. E2E를 위해 새로 추가할 때는 컴포넌트 코드에 직접 추가한다.

```tsx
// TagChipInput.tsx — 이미 존재
<div data-testid="tag-chip" className="group ...">
```

## 비동기 패턴

### 네트워크 응답 대기

```typescript
// ✅ PATCH/POST 완료 후 상태 확인
await Promise.all([
  page.waitForResponse(
    (res) => res.url().includes('/notes/') && res.request().method() === 'PATCH',
  ),
  page.getByRole('button', { name: '저장' }).click(),
]);

// ❌ 임의의 sleep
await page.waitForTimeout(1000);
```

### 요소 대기

```typescript
// ✅ Playwright 자동 대기 활용 — toBeVisible()은 내부적으로 retry
await expect(locator).toBeVisible();

// ❌ 수동 polling
while (!(await locator.isVisible())) {
  await page.waitForTimeout(100);
}
```

## 단언 패턴

```typescript
// 요소 존재/가시성
await expect(page.getByTestId('tag-chip')).toBeVisible();
await expect(page.getByTestId('tag-chip')).toHaveCount(3);

// 요소 부재
await expect(page.getByTestId('tag-chip')).not.toBeVisible();
await expect(page.getByTestId('tag-chip')).toHaveCount(0);

// 텍스트
await expect(locator).toContainText('work');
await expect(locator).toHaveText('work'); // 정확 일치

// 비활성화 상태
await expect(page.getByRole('textbox')).toBeDisabled();

// API 응답으로 영속성 검증
const res = await request.get(`http://localhost:3001/notes/${noteId}`);
const note = await res.json();
expect(note.tags).toEqual(['work', 'study']);
```

## 안티패턴

```typescript
// ❌ 구현 세부사항 단언 (클래스명, 인라인 스타일)
await expect(locator).toHaveClass('opacity-0 group-hover:opacity-100'); // 단위 테스트 영역

// ❌ 단위 테스트 로직 중복 (maxLen 15자 차단)
await input.fill('1234567890123456'); // useTagInput 훅 단위 테스트가 이미 커버

// ❌ page.evaluate()로 React 내부 상태 직접 접인
await page.evaluate(() => (window as any).__reactState); // 금지

// ❌ 특정 CSS 클래스에 의존한 클릭
await page.locator('.group:hover .opacity-100').click();
```

## hover 트리거 UI 테스트

```typescript
// ✅ hover() 후 요소 등장 대기
await page.getByTestId('tag-chip').first().hover();
await expect(page.getByRole('button', { name: '태그 삭제' }).first()).toBeVisible();
await page.getByRole('button', { name: '태그 삭제' }).first().click();
```

## 이 프로젝트 특이사항

- `webServer`가 `npm run dev`를 자동 실행 (Vite :5173 + JSON Server :3001)
- `reuseExistingServer: true` — 이미 실행 중이면 재사용
- chromium 단일 브라우저만 사용 (playwright.config.ts)
- 노트 저장 API: `PATCH http://localhost:3001/notes/:id`
- 노트 생성 API: `POST http://localhost:3001/notes`

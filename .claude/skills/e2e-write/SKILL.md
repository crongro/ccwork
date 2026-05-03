---
name: e2e-write
description: >
  docs/features/{기능명}/prd.md의 사용자 스토리를 읽어 Playwright E2E 테스트를 작성한다.
  "/e2e-write {기능명}" 또는 "E2E 테스트 작성해줘" 요청 시 사용한다.
  단위 테스트(Vitest + RTL)가 커버하는 격리 검증은 중복하지 않고,
  실제 브라우저에서의 사용자 여정(user journey)과 API 영속성만 다룬다.
  프로젝트: React 19 + TypeScript + Vite + JSON Server, Playwright chromium, baseURL http://localhost:5173,
  webServer가 npm run dev를 자동 실행하므로 앱을 별도로 띄울 필요 없음.
  테스트 파일 위치: tests/{기능명}.spec.ts
---

# e2e-write

## 사전 읽기

```
Read: docs/features/{기능명}/prd.md          ← 사용자 스토리(US) + 수용 기준(AC)
Bash: find src -name "*.test.*"              ← 기존 단위 테스트 목록 파악
Read: 관련 테스트 파일들                       ← 이미 커버된 검증 확인
```

## 시나리오 선택 기준

### E2E에서 다루는 것

- 여러 컴포넌트를 가로지르는 **완전한 사용자 여정** (선택 → 상호작용 → 결과 확인)
- **실제 API 연동** (JSON Server PATCH/POST/DELETE 후 화면 반영 확인)
- **브라우저 특유 동작** (hover 트리거 가시성, 실제 keyboard 이벤트)
- **영속성 검증** (저장 후 노트 전환 → 재선택 시 데이터 유지)

### E2E에서 제외하는 것 (단위 테스트 담당)

- 개별 훅 로직 (trim, 중복 체크, maxLen, maxTags 규칙)
- 컴포넌트 prop 바인딩, 이벤트 위임 확인
- 격리된 상태 전이 (renderHook 수준)
- IME 조합 guard 등 브라우저 구현 세부사항

## 워크플로우

### Step 1 — 컨텍스트 수집

prd.md와 기존 단위 테스트를 읽어 각 US의 AC를 정리한다.

### Step 2 — 시나리오 매핑

각 US별 AC 항목을:

- 단위 테스트 커버 → 제외
- 실제 브라우저/API 필요 → E2E 시나리오로 선정

선정한 시나리오 목록을 간략히 기록하고 진행한다.

### Step 3 — 테스트 파일 작성

`tests/{기능명}.spec.ts` 파일을 아래 구조로 작성한다.

## 파일 구조

```typescript
import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001';

// ⚠️ 병렬 실행(workers) 시 제목 충돌 방지 — 반드시 고유 suffix 사용
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

test.describe('{기능명}', () => {
  let noteId: string;
  let noteTitle: string; // 고유 제목 저장 → 클릭 시 사용

  test.beforeEach(async ({ request }) => {
    const note = await createTestNote(request);
    noteId = note.id;
    noteTitle = note.title;
  });

  test.afterEach(async ({ request }) => {
    await request.delete(`${API}/notes/${noteId}`).catch(() => {});
  });

  test('시나리오 설명', async ({ page, request }) => {
    await page.goto('/');
    await page.getByText(noteTitle).first().click(); // 고유 제목으로 클릭
    // 인터랙션 + 단언
  });
});
```

## 셀렉터 우선순위

1. `getByRole('textbox', { name: '...' })` — 접근성 role + label
2. `getByPlaceholder('...')` — placeholder 텍스트 (태그 0개일 때만 노출)
3. `getByLabel('...')` — label 연결
4. `getByTestId('...')` — `data-testid` (프로젝트에 존재하는 것만)
5. `locator('css selector')` — 최후 수단

현재 프로젝트 `data-testid`:

- `tag-chip` — TagChipInput 칩 (각 확정된 태그)
- `tag-chip-input` — 태그 입력 input (placeholder 유무 관계없이 항상 존재)

> `getByPlaceholder('태그 입력 후 Enter')`는 태그 추가 후 placeholder가 `''`로 바뀌어 locator 실패.
> **태그 입력창은 항상 `getByTestId('tag-chip-input')`으로 접근한다.**

## 핵심 패턴

### 태그 입력 (placeholder 비의존)

```typescript
const input = page.getByTestId('tag-chip-input');
await input.fill('work');
await input.press('Enter');
// 또는
await input.press(',');
```

### 단언

```typescript
await expect(page.getByTestId('tag-chip')).toHaveCount(1);
await expect(page.getByTestId('tag-chip').first()).toContainText('work');
await expect(input).toHaveValue('');

// API 레벨 영속성 확인
const saved = await request.get(`${API}/notes/${noteId}`);
expect((await saved.json()).tags).toContain('work');
```

### opacity 기반 hover UI (CSS 단언 필수)

Playwright는 `opacity: 0` 요소를 `toBeVisible()` 기준으로 **visible**로 처리한다.
`opacity`로 숨긴 UI는 반드시 `toHaveCSS`로 단언한다.

```typescript
const chip = page.getByTestId('tag-chip').first();
const removeBtn = chip.getByRole('button', { name: '태그 삭제' });

await expect(removeBtn).toHaveCSS('opacity', '0'); // 기본 상태
await chip.hover();
await expect(removeBtn).toHaveCSS('opacity', '1'); // hover 후
await removeBtn.click();
```

### 저장 + 영속성 검증

저장 후 React state와의 타이밍 이슈를 피하려면 `page.reload()`로 전체 재조회한다.

```typescript
await page.getByRole('button', { name: '저장' }).click();
await page.waitForResponse(
  (res) => res.url().includes('/notes/') && res.request().method() === 'PATCH',
);
await page.reload(); // 로컬 상태 초기화 + JSON Server 재조회
await page.getByText(noteTitle).first().click();
await expect(page.getByTestId('tag-chip')).toHaveCount(1);
```

## Best Practice 상세

셀렉터 전략, 안티패턴, 테스트 격리 주의사항은 [references/best-practices.md](references/best-practices.md) 참조.

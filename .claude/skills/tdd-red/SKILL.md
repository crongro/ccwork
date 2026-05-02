---
name: tdd-red
description: TDD의 Red 단계를 수행한다. `test-scenarios` 스킬이 만든 `docs/features/{feature}/issue-{N}.md`의 승인된 시그니처와 시나리오를 입력으로, 실패하는 테스트 코드를 한 시나리오씩 작성·실행하여 모두 Red(실패) 상태로 만든다. Vitest + React Testing Library 사용. 테스트 파일은 대상 코드와 같은 디렉터리에 `{파일명}.test.ts(x)`로 co-locate. **비즈니스 로직 작성 금지** — 테스트 파일과 시그니처-only stub만 생성/수정한다 (stub 본문은 `throw new Error('not implemented')`). Use when (1) 사용자가 `/tdd-red <이슈번호>` 명령을 사용할 때, (2) 사용자가 "Red 단계", "실패 테스트 작성", "TDD 시작 (시나리오 확정 후)", "테스트 코드 작성" 등을 언급할 때, (3) `test-scenarios`로 만든 `issue-{N}.md`가 존재하고 시나리오가 [GATE] 통과된 직후 단계에서. 통과(Green)는 만들지 않는다.
---

# TDD Red

`test-scenarios` 스킬이 산출한 `issue-{N}.md`의 **시그니처 + 시나리오**를 입력으로 받아, 실패하는 테스트 코드를 작성한다. 시나리오를 하나씩 코드화하고, 매번 실행해서 **실패하는 이유가 의도한 이유인지** 확인한다.

이 스킬이 만지는 파일은 두 종류뿐이다:

1. **테스트 파일** — `*.test.ts(x)`. 자유롭게 생성/수정.
2. **시그니처-only stub** — 테스트가 import해야 하는데 아직 존재하지 않는 모듈. 함수/훅/컴포넌트의 **파라미터·반환 타입만** 적고, 본문은 `throw new Error('not implemented: <name>')`로 채운다. 비즈니스 로직(조건문·반환값·상태 갱신)은 절대 적지 않는다 — 그건 Green의 일이다.

이 외 `src/` 파일은 읽기만 한다.

## 입력

- `$ARGUMENTS` — GitHub 이슈 번호 (예: `1`)
- 슬래시 호출: `/tdd-red 1`
- 전제: `docs/features/{feature}/issue-{N}.md`가 이미 존재하고 사용자 승인이 끝난 상태

## 핵심 원칙

1. **비즈니스 로직 작성 금지 — stub은 허용.** `src/` 하위에서 `*.test.ts(x)`가 아닌 파일은 기본적으로 읽기만 한다. 단, 테스트가 import해야 하는 모듈이 없으면 **시그니처-only stub**을 만든다: 함수/훅/컴포넌트의 파라미터·반환 타입만 적고, 본문은 `throw new Error('not implemented: <name>')`. 조건문·반환값·상태 갱신 같은 동작은 절대 적지 않는다 — 그건 Green의 일이다.
2. **collect 단계 실패는 안 된다.** `Failed to resolve import` / `Cannot find module`은 vitest가 시나리오를 카운트조차 못 하는 상태 — 진짜 Red가 아니다. 반드시 stub으로 해소해서 모든 시나리오가 정상 collect·실행되도록 한다.
3. **한 번에 하나씩.** 시나리오 1개 작성 → 실행 → 실패 확인 → 다음 시나리오. 여러 개를 미리 일괄 작성해서 무더기로 실패시키지 않는다. 같은 모듈의 두 번째 시나리오부터는 stub을 재사용한다 (새로 안 만든다).
4. **실패 이유 검증.** 의도된 실패: stub의 `Error: not implemented` throw, assertion 실패 (`expected X to equal Y`). 의도되지 않은 실패: 테스트 코드의 syntax/import 오타, 모킹 설정 실수 — 이 경우 테스트 코드를 고친다 (시나리오를 바꾸는 게 아님).
5. **시그니처에 적힌 이름·타입을 그대로 사용.** `issue-{N}.md`의 `## 시그니처` 섹션을 단일 진실의 출처(SoT)로 삼는다. stub의 시그니처도 여기서 그대로 옮긴다. 임의 변경 금지 — 변경 필요 시 `test-scenarios`로 돌아간다.
6. **마지막에 npm test 전체 실행.** 모든 시나리오 작성 후 `npm test`를 1회 돌려 모두 카운트되고 빨간색인지 확인한다.

## 테스트 파일 컨벤션

### 위치 — 대상 코드와 **같은 디렉터리**에 co-locate

| 대상 코드                      | 테스트 파일                         |
| ------------------------------ | ----------------------------------- |
| `src/api/tags.ts`              | `src/api/tags.test.ts`              |
| `src/components/TagInput.tsx`  | `src/components/TagInput.test.tsx`  |
| `src/hooks/useTagInput.ts`     | `src/hooks/useTagInput.test.ts`     |
| `src/context/NotesContext.tsx` | `src/context/NotesContext.test.tsx` |

- 확장자 규칙: 대상이 `.tsx`이면 테스트도 `.test.tsx`, `.ts`이면 `.test.ts`.
- 대상 파일이 아직 존재하지 않아도(이슈가 신규 생성하는 모듈) 테스트는 **그 자리에 만든다**. 테스트가 import할 때 "Cannot find module" 실패가 나오는 게 Red의 자연스러운 첫 단계다.

### 네이밍 — `describe` + `it`

- `describe`: 함수/훅/컴포넌트 단위로 묶는다. `describe('useTagInput', () => { ... })`
- 같은 함수의 메서드는 중첩 describe를 쓴다: `describe('useTagInput', () => { describe('commit', () => { ... }) })`
- `it`: **`should [기대 동작] when [조건]`** 형식 (영문 BDD).
  - 예: `it('should add trimmed tag to tags when input is non-empty')`
  - 예: `it('should not call commit when key is not Enter')`
- `issue-{N}.md`의 시나리오 문장에 이미 `should ... when ...` 형식이 들어 있으면 거의 그대로 옮긴다.

### 사용 도구

- **Vitest**: `import { describe, it, expect, vi, beforeEach } from 'vitest'`
- **React Testing Library** (컴포넌트/훅): `import { render, screen } from '@testing-library/react'`, `import { renderHook, act } from '@testing-library/react'`
- **user-event** (사용자 입력): `import userEvent from '@testing-library/user-event'`
- **jest-dom matchers**: `src/test-setup.ts`에서 이미 글로벌 등록되어 있음 (`toBeInTheDocument()` 등 바로 사용)
- **API 모킹**: 실제 JSON Server에 의존하지 않는다. `global.fetch`를 `vi.fn()`으로 교체하거나, 모듈 단위로 `vi.mock('../api/notes')` 사용.

## 파이프라인

```
docs/features/{feature}/issue-{N}.md (시그니처 + 시나리오, 승인 완료)
    ↓ 단계 1 — 사전 점검
이슈 파일 존재 + 미존재 모듈 식별 → stub 일괄 생성
    ↓ 단계 2 — 시나리오별 Red 루프
각 시나리오: 테스트 작성 → 실행 → 실패 확인(stub throw or assertion) → 다음
    ↓ 단계 3 — 전체 검증
npm test → 모든 시나리오가 카운트되고 실패(Red) 상태인지 확인
    ↓
TDD Green 단계로 인계 (다른 스킬/사람이 담당)
```

---

## 단계 1: 사전 점검

1. **이슈 파일 위치 확인** — `docs/features/{feature}/issue-{$ARGUMENTS}.md`를 찾는다. 이슈 라벨/제목의 prefix(`TAG-*` → `tag/`)로 `{feature}` 디렉터리를 식별. 모호하면 사용자에게 묻는다.
2. **시그니처와 시나리오 읽기** — 파일 전체를 읽어 다음을 추출한다:
   - `## 시그니처` — 타입, 함수/훅, 에러 케이스, 컴포넌트 Props
   - `## 테스트 시나리오` — `### 정상`, `### 경계`, `### 예외` 아래 각 항목
3. **테스트 대상 파일 매핑** — 시그니처에 적힌 파일 경로(`// src/hooks/useTagInput.ts` 같은 주석)를 보고, 시나리오마다 어느 테스트 파일에 들어갈지 미리 매핑한다. 같은 모듈의 시나리오는 같은 테스트 파일에 모은다.
4. **미존재 모듈 식별 + stub 일괄 생성** — 매핑 결과 중 아직 `src/`에 존재하지 않는 모듈을 모두 찾아 시그니처-only stub을 만든다. 이 단계를 **단계 2 진입 전에** 끝내야 첫 시나리오부터 collect 단계 실패 없이 깔끔한 Red가 잡힌다. 각 stub의 형태는 아래 [Stub 작성 규칙](#stub-작성-규칙) 참조. 기존에 존재하는 타입(예: `Note`)에 필드 추가가 필요한 경우도 여기서 처리 — 단, **추가만 하고 동작은 바꾸지 않는다**.
5. **사용자에게 작성 계획 제시** — "다음 순서로 N개 시나리오를 작성합니다 + stub M개를 먼저 만들었습니다" 한 단락. 사용자가 `OK`/`진행`을 줄 때까지 단계 2를 시작하지 않는다 (가벼운 게이트, 한 번만).

### Stub 작성 규칙

- **함수/훅**: 시그니처 선언 + 본문 두 줄 `void <param>;` + `throw new Error('not implemented: <name>')`. `void`로 unused 경고 회피 (프로젝트 ESLint가 `_` prefix를 ignore하지 않음).

  ```ts
  // src/hooks/useTagInput.ts
  import type React from 'react';

  export function useTagInput(initialTags: string[]): {
    tags: readonly string[];
    input: string;
    setInput: (value: string) => void;
    commit: () => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  } {
    void initialTags;
    throw new Error('not implemented: useTagInput');
  }
  ```

- **컴포넌트**: Props 인터페이스 + 명시적 `ReactNode` 반환 타입 + `void props;` + throw. 반환 타입을 명시해야 JSX로 사용 가능 (throw-only 함수는 TS가 `void`로 추론하기 때문).

  ```tsx
  // src/components/TagChipInput.tsx
  import type { ReactNode } from 'react';

  interface TagChipInputProps {
    tags: readonly string[];
    input: string;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }

  export function TagChipInput(props: TagChipInputProps): ReactNode {
    void props;
    throw new Error('not implemented: TagChipInput');
  }
  ```

- **타입에 필드 추가**: 시그니처 SoT대로 필드만 추가. 호출부 타입 에러는 vitest 런타임에 영향 없으므로 무시 (Green이 책임). 단, 다른 테스트 파일이 같은 타입을 쓰는데 의미상 깨질 수 있으면 한 줄 보고 후 진행.
- **금지 사항**: `if`, `return value`, `useState`, `setTags(...)` 같은 동작 코드. stub의 마지막 라인은 항상 `throw`다.

## 단계 2: 시나리오별 Red 루프

각 시나리오에 대해 다음을 반복한다:

### 2-(a). 테스트 코드 작성

- 해당 시나리오를 표현하는 **`it` 블록 1개**를 추가한다 (테스트 파일이 없으면 새로 만들고 import/describe 골격까지 함께 작성).
- `it` 본문에는 Arrange–Act–Assert 3단계를 명시적으로 분리한다. 짧아도 패턴은 유지.
- 모킹은 시그니처의 "에러 케이스" 표를 참조해 결정 — 예: `updateNote` 호출 페이로드 검증이면 `vi.mock('../api/notes')`로 export된 `updateNote`를 spy로 교체.
- **assert는 시나리오 문장을 직역**한다. "input.trim()을 tags에 추가" → `expect(result.current.tags).toEqual(['work'])`처럼 한 가지 동작을 한 가지 expect로.

### 2-(b). 즉시 실행

- 단일 파일만 돌려 빠르게 확인한다: `npx vitest run path/to/file.test.ts -t "should ... when ..."` (`-t`로 방금 추가한 테스트만 필터).
- 실패 메시지를 확인한다.

### 2-(c). 실패 이유 검증

- 의도된 실패 패턴:
  - `Error: not implemented: <name>` — stub의 throw에 도달 (가장 흔함)
  - assertion 실패: `expected X to equal Y` — stub 외 기존 모듈이 시나리오와 다른 동작 (예: `fetchNotes`가 정규화 미구현)
  - `... is not a function` / `is not exported` — stub의 시그니처가 시나리오와 안 맞음 (이 경우 stub의 시그니처를 보강. `issue-{N}.md`와 비교해서 stub이 누락한 멤버 추가)
- **금지된 실패 패턴**:
  - `Failed to resolve import 'XXX'` / `Cannot find module 'XXX'` — collect 단계 실패. 즉시 stub을 만들어 해소한다. 이 상태로 다음 시나리오로 넘어가지 않는다.
- **의도되지 않은 실패**: 테스트 코드의 syntax error, import 경로 오타, 모킹 설정 실수. 이 경우 테스트 코드를 고쳐서 다시 돌린다 (시나리오를 바꾸는 게 아니라 테스트 표현을 고치는 것).
- 의심스러우면 한 줄 보고: `"#5는 'Error: not implemented: useTagInput'으로 실패 — stub throw 도달, 의도 일치"`

### 2-(d). 다음 시나리오로

- `issue-{N}.md`의 시나리오 순서대로 진행 (정상 → 경계 → 예외).
- 한 시나리오를 끝내기 전에 다음 시나리오의 코드를 미리 쓰지 않는다.

## 단계 3: 전체 검증

1. 모든 시나리오 코드화가 끝나면 **`npm test`** 를 1회 실행한다.
2. 결과를 보고:
   - 작성한 모든 시나리오가 실패(`failed`)로 카운트되는가
   - **기존에 통과하던 테스트가 새로 깨지지 않았는가** — 깨졌다면 import/모킹이 다른 테스트에 부수효과를 줬을 가능성. 원인을 찾아 테스트 코드 쪽에서 수정 (구현 코드 절대 X).
   - 작성하지 않은 시나리오가 누락되지 않았는가 — `issue-{N}.md`의 시나리오 번호와 1:1로 대조한다.
3. 사용자에게 요약 보고:
   ```
   ✅ 작성한 시나리오: 23개
   ❌ 실패: 23개 (의도된 Red)
   ✅ 기존 통과 테스트: 영향 없음
   파일:
     - src/hooks/useTagInput.test.ts (신규, 14개)
     - src/components/TagChipInput.test.tsx (신규, 6개)
     - src/api/notes.test.ts (신규, 3개)
   다음 단계: TDD Green (구현 작성)
   ```

---

## 테스트 작성 예시

### 훅 테스트 — `useTagInput.test.ts`

```ts
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

  describe('commit', () => {
    it('should add trimmed tag to tags when input is non-empty', () => {
      const { result } = renderHook(() => useTagInput([]));

      act(() => result.current.setInput('  work  '));
      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['work']);
      expect(result.current.input).toBe('');
    });

    it('should not change tags when input is empty', () => {
      const { result } = renderHook(() => useTagInput(['existing']));

      act(() => result.current.commit());

      expect(result.current.tags).toEqual(['existing']);
    });
  });
});
```

### 컴포넌트 테스트 — `TagChipInput.test.tsx`

```tsx
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
});
```

### API 모킹 테스트 — `notes.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNotes } from './notes';

describe('fetchNotes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should default tags to [] when API response omits the field', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([{ id: '1', title: 't', content: 'c', createdAt: '', updatedAt: '' }]),
        { status: 200 },
      ),
    );

    const notes = await fetchNotes();

    expect(notes[0].tags).toEqual([]);
  });
});
```

---

## 자주 하는 실수 (피할 것)

- **stub에 비즈니스 로직 슬쩍 넣기**: stub은 시그니처 + `throw new Error('not implemented')`로 끝. `if (input)`, `return [...tags, x]`, `useState` 같은 동작은 Green의 일이다. stub의 마지막 줄이 항상 `throw`인지 확인.
- **stub 없이 모듈 미존재로 두기**: vitest가 collect 단계에서 실패하면 시나리오가 카운트되지 않는다 (`0 tests collected`). 명확한 Red 카운트를 위해 단계 1에서 미리 stub을 일괄 생성한다.
- **시나리오 일괄 작성**: 23개를 한 번에 써놓고 `npm test`로 모두 빨간색을 확인하면 어느 한 시나리오의 실패가 다른 테스트의 부수효과인지 분간이 안 된다. 한 개씩 돌린다.
- **`-t` 필터 안 쓰고 매번 전체 실행**: 매 시나리오마다 전체 스위트를 돌리면 느리다. `-t "should ... when ..."`로 방금 쓴 것만 검증.
- **시그니처 무시하고 작명**: 시그니처에 `commit`이라고 적혀 있는데 테스트에서는 `addTag`라고 호출하면 작성자가 시그니처를 바꿔야 했던 것이지 테스트가 마음대로 정할 일이 아니다. 변경이 필요하면 사용자에게 묻고 `issue-{N}.md`부터 갱신.
- **테스트가 통과해버림**: 임의 mock 반환값이 우연히 assertion과 맞아 통과하는 경우. Red 단계에서 통과는 위험 신호 — 테스트가 실제 동작을 검증하지 못하고 있다는 뜻. assert를 더 구체적으로 강화한다. (단, 사전에 합의한 가드레일 시나리오는 예외.)
- **AC 누락**: `issue-{N}.md`의 AC 커버리지 표에 적힌 시나리오 번호와 작성한 `it` 개수를 마지막에 1:1로 대조한다. 표의 시나리오가 코드에 없으면 누락.
- **기존 테스트를 깨뜨림**: 새 테스트의 모킹이 글로벌 fetch나 모듈 캐시를 오염시켜 다른 테스트가 실패. `beforeEach(() => vi.restoreAllMocks())`로 격리.
- **stub 본문에 동작 코드 추가**: 만약 "테스트가 돌려면 stub 본문에 `if`를 하나만 넣으면 됩니다"라는 충동이 든다면, 그건 Green을 시작한 것이다 — 멈추고 사용자에게 보고한다.

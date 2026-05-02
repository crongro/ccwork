# Issue #3 — TAG-3: 태그 입력 검증 규칙 (trim·중복·길이·개수)

> 출처: GitHub Issue #3
> 관련 PRD: docs/features/tag/prd.md
> 의존: TAG-1 (Issue #1), TAG-2 (Issue #2)

## 시그니처

### 타입

변경 없음. `Note.tags: string[]`은 TAG-1에서 추가됨.

### 함수/훅

```ts
// src/hooks/useTagInput.ts — options 파라미터 + isFull 반환값 추가
function useTagInput(
  initialTags: string[],
  options?: { maxTags?: number; maxLen?: number },
): {
  tags: readonly string[];
  input: string;
  isFull: boolean; // ← 추가
  setInput: (value: string) => void;
  commit: () => void;
  removeTag: (tag: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
// 기본값: maxTags = 10, maxLen = 15
// 테스트에서는 { maxTags: 3, maxLen: 5 } 등 소값으로 오버라이드
```

### 에러 케이스

| 위치              | 입력                    | 동작                                      |
| ----------------- | ----------------------- | ----------------------------------------- |
| `setInput(value)` | `value.length > maxLen` | no-op — input 현재 값 유지                |
| `commit()`        | `isFull === true`       | 완전 no-op — tags, input 모두 불변        |
| `commit()`        | `input.trim() === ''`   | input만 비움, tags 불변 (TAG-1 동작 유지) |
| `commit()`        | 대소문자 무시 중복      | input만 비움, tags 불변, 에러 미표시      |

### 컴포넌트 Props

```ts
// src/components/TagChipInput.tsx — isFull prop 추가
interface TagChipInputProps {
  tags: readonly string[];
  input: string;
  isFull: boolean; // ← 추가
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void;
}
// isFull === true 일 때 <input disabled />
```

### NoteEditor (내부 변경, Props 시그니처 변경 없음)

```ts
// 내부 변경만:
// useTagInput(initialTags, { maxTags: 10, maxLen: 15 }) 호출로 교체
// isFull destructure → <TagChipInput isFull={isFull} /> 에 전달
```

---

## 테스트 시나리오

### 정상

<!-- prettier-ignore -->
1. [x] [정상] **useTagInput** — should expose isFull in returned object when initialized with options
2. [x] [정상] **useTagInput** — should not expose setTags in returned object when initialized
3. [x] [정상] **useTagInput.isFull** — should be false when tags count is below maxTags
4. [x] [정상] **useTagInput.setInput** — should update input when value length is within maxLen
5. [x] [정상] **useTagInput.commit** — should add tag when input does not match any existing tag case-insensitively

### 경계

<!-- prettier-ignore -->
6. [x] [경계] **useTagInput.setInput** — should update input when value length equals maxLen exactly
7. [x] [경계] **useTagInput.setInput** — should not update input when value length exceeds maxLen
8. [x] [경계] **useTagInput.commit** — should not add tag and should clear input when input is same-case duplicate of existing tag
9. [x] [경계] **useTagInput.commit** — should not add tag and should clear input when input is different-case duplicate of existing tag
10. [x] [경계] **useTagInput.isFull** — should be true when tags count equals maxTags
11. [x] [경계] **useTagInput.commit** — should not change tags or input when isFull is true (complete no-op)
12. [x] [경계] **useTagInput.isFull** — should become false after removeTag is called on a full tag list
13. [x] [경계] **TagChipInput** — should render input as disabled when isFull is true

### 예외

<!-- prettier-ignore -->
14. [x] [예외] **TagChipInput** — should render input as enabled (not disabled) when isFull is false
15. [x] [예외] **NoteEditor** — should render tag input as disabled when note has maxTags (10) initial tags

## AC 커버리지

| AC                                                                | 커버하는 시나리오                        |
| ----------------------------------------------------------------- | ---------------------------------------- |
| **AC-1** `useTagInput(initialTags, { maxTags, maxLen })` 시그니처 | #1, #3, #4, #6, #7, #10                  |
| **AC-2** setInput에서 maxLen 초과 값 차단                         | #4, #6, #7                               |
| **AC-3** commit() trim 결과 빈 문자열 → no-op (입력만 비움)       | TAG-1 기존 테스트 (issue-1.md #시나리오) |
| **AC-4** 대소문자 무시 중복 → 추가 안 함, input 비움, 에러 미표시 | #5, #8, #9                               |
| **AC-5** isFull 상태 노출 + commit no-op + 입력란 disabled        | #10, #11, #12, #13, #14, #15             |
| **AC-6** 4가지 규칙을 renderHook 단위 테스트로 커버               | #4~#12 (useTagInput 시나리오 전체)       |
| **AC-7** tags를 읽기 전용으로만 노출, setTags 미노출              | #2                                       |

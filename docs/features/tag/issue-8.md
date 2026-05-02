# Issue #8 — TAG-4: 태그 UX 보강 (placeholder·쉼표 확정·노트 전환 동기화)

> 출처: GitHub Issue #8
> 관련 PRD: docs/features/tag/prd.md
> 의존: TAG-1 (Issue #5), TAG-3 (Issue #7)

## 시그니처

### 타입

변경 없음. `Note.tags: string[]`은 TAG-1에서 추가됨.

### 함수/훅

```ts
// src/hooks/useTagInput.ts — reset 추가
function useTagInput(
  initialTags: string[],
  options?: { maxTags?: number; maxLen?: number },
): {
  tags: readonly string[];
  input: string;
  isFull: boolean;
  setInput: (value: string) => void;
  commit: () => void;
  removeTag: (tag: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  reset: (nextTags: string[]) => void; // ← 추가
};
// handleKeyDown 내부 변경: ',' 키 → e.preventDefault() + commit()
```

### 에러 케이스

| 위치              | 입력          | 동작                                                                       |
| ----------------- | ------------- | -------------------------------------------------------------------------- |
| `handleKeyDown`   | `key === ','` | `e.preventDefault()` + `commit()` 호출 (쉼표 문자가 input에 삽입되지 않음) |
| `reset(nextTags)` | —             | tags를 nextTags로 교체, input을 '' 로 초기화. 에러 없음                    |

### 컴포넌트 Props

```ts
// src/components/TagChipInput.tsx — Props 변경 없음
// 내부 변경만:
// <input
//   placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
//   ...
// />
```

### NoteEditor (내부 변경, Props 시그니처 변경 없음)

```ts
// 내부 변경만:
// useTagInput에서 reset을 destructure
// useEffect에서 selectedNote 변경 시 reset(selectedNote.tags) 호출
// isCreating 전환 시 reset([]) 호출
```

---

## 테스트 시나리오

### 정상

<!-- prettier-ignore -->
1. [x] [정상] **useTagInput** — should expose reset in returned object when initialized
2. [x] [정상] **useTagInput.handleKeyDown** — should commit current input to tags when comma key is pressed
3. [x] [정상] **useTagInput.handleKeyDown** — should clear input when comma key is pressed and input is non-empty
4. [x] [정상] **useTagInput.reset** — should replace tags with nextTags when called
5. [x] [정상] **useTagInput.reset** — should reset input to empty string when called
6. [x] [정상] **TagChipInput** — should render input with placeholder "태그 입력 후 Enter" when tags is empty
7. [x] [정상] **NoteEditor** — should show note B's tags and clear input when selectedNoteId changes from note A to note B

### 경계

<!-- prettier-ignore -->
8. [x] [경계] **useTagInput.handleKeyDown** — should not add tag when comma is pressed and input is empty
9. [x] [경계] **useTagInput.handleKeyDown** — should call preventDefault when comma key is pressed
10. [x] [경계] **useTagInput.reset** — should set tags to [] when called with empty array
11. [x] [경계] **TagChipInput** — should not show placeholder when tags has at least one tag

### 예외

(없음)

## AC 커버리지

| AC                                                    | 커버하는 시나리오              |
| ----------------------------------------------------- | ------------------------------ |
| **AC-1** `,` 키로 칩 확정 (쉼표 미포함)               | #2, #3, #8, #9                 |
| **AC-2** tags=0일 때 placeholder 표시                 | #6                             |
| **AC-3** tags≥1이면 placeholder 미표시                | #11                            |
| **AC-4** `reset(nextTags)` 노출 + NoteEditor에서 호출 | #1, #4, #5, #10                |
| **AC-5** 노트 전환 시 B 태그 표시 + 입력란 초기화     | #7                             |
| **AC-6** NoteItem 태그 미표시 (scope 외)              | 시나리오 없음 (기존 동작 유지) |

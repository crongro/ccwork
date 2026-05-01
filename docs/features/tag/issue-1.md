# 이슈 #1 — TAG-1: 태그 추가·저장 MVP 파이프라인

> 출처: GitHub 이슈 #1
> 관련 PRD: docs/features/tag/prd.md

## 시그니처

### 타입

```ts
// src/types/note.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[]; // 신규 — 선택적 아님, 항상 string[]
}
```

- ADR-1 "노트 내부 임베드" / PRD 용어정의의 `Note.tags: string[]`.
- AC-1의 누락 보정은 타입을 optional로 만들지 않고, `fetchNotes` 응답 매핑에서 `tags ?? []`로 정규화해 처리한다 (타입 불변식 유지).

### 함수/훅

```ts
// src/hooks/useTagInput.ts
function useTagInput(initialTags: string[]): {
  tags: readonly string[];
  input: string;
  setInput: (value: string) => void;
  commit: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
```

- AC-2 명시 5요소. `removeTag`/`reset`/`isFull`/options는 TAG-2/3/4 슬라이스에서 추가 — TAG-1에서는 제외.
- `tags`를 `readonly string[]`로 노출해 ADR-4의 "컴포넌트가 `setTags`를 직접 못 건드림" 정책을 처음부터 강제.

```ts
// src/api/notes.ts — 기존 시그니처 변경 없음
async function fetchNotes(): Promise<Note[]>;
async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
async function updateNote(id: string, updates: Partial<Note>): Promise<Note>;
```

- `Note`에 `tags`가 추가되었으므로 `Partial<Note>`/`Omit<...>`을 통해 자동으로 `tags`가 payload에 포함 가능 (AC-5, AC-6 충족, 새 API 미추가).

### 에러 케이스

| 위치                | 입력                             | 동작                                                            |
| ------------------- | -------------------------------- | --------------------------------------------------------------- |
| `commit()`          | `input.trim() === ''`            | 아무 동작 없음 (칩 미추가). 호출 후 `input`은 항상 `''`로 리셋  |
| `commit()`          | 정상 문자열                      | `input.trim()`을 `tags`에 추가, `input`은 `''`로 리셋           |
| `handleKeyDown`     | `e.key === 'Enter'`              | `commit()` 호출 (`,` 처리는 TAG-4)                              |
| `handleKeyDown`     | 그 외 키                         | 브라우저 기본 동작 위임, 예외 던지지 않음                       |
| `fetchNotes` 정규화 | 응답 노트의 `tags`가 `undefined` | `[]`로 보정 (조용히 처리)                                       |
| `updateNote`        | `!res.ok`                        | 기존대로 `throw new Error('Failed to update note')` (변경 없음) |

### 컴포넌트 Props

```ts
// src/components/TagChipInput.tsx
interface TagChipInputProps {
  tags: readonly string[];
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
```

- ADR-3 — 얇은 프레젠테이셔널 컴포넌트. 훅 반환값을 그대로 받아 JSX 바인딩만 함.
- TAG-1 스코프상 × 버튼/Backspace는 없음 → `onRemove` 미포함. `commit`은 `onKeyDown` 안에서 호출되므로 별도 prop 없음.

```ts
// src/components/NoteEditor.tsx — Props 시그니처 변경 없음
interface NoteEditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}
```

- 내부 변경만: `useTagInput(selectedNote?.tags ?? [])` 호출, `handleSave`에서 `updateNote(id, { title, content, tags })` payload에 `tags` 추가.

---

## 테스트 시나리오

### 정상

1. [정상] **useTagInput** — 초기화 후 `tags`, `input`, `setInput`, `commit`, `handleKeyDown`을 노출해야 한다
2. [정상] **useTagInput** — `initialTags` 인자로부터 `tags`를 초기화해야 한다
3. [정상] **useTagInput** — `input`을 빈 문자열로 초기화해야 한다
4. [정상] **useTagInput.setInput** — 호출 시 `input` 값을 갱신해야 한다
5. [정상] **useTagInput.commit** — input이 비어있지 않을 때 `input.trim()`을 `tags`에 추가하고 `input`을 `''`로 리셋해야 한다
6. [정상] **useTagInput.commit** — 여러 번 commit 시 입력 순서를 보존해야 한다 (`["work"]` → "study" → `["work","study"]`)
7. [정상] **useTagInput.handleKeyDown** — 키가 `Enter`일 때 `commit()`을 호출해야 한다
8. [정상] **TagChipInput** — `tags`가 비어있지 않으면 각 태그를 칩으로 렌더링해야 한다
9. [정상] **TagChipInput** — 사용자가 input에 입력하면 새 값과 함께 `onInputChange`를 호출해야 한다
10. [정상] **TagChipInput** — 사용자가 키를 누르면 KeyboardEvent와 함께 `onKeyDown`을 호출해야 한다
11. [정상] **NoteEditor** — 제목과 본문 textarea 사이에 `TagChipInput`을 렌더링해야 한다
12. [정상] **NoteEditor** — 저장 버튼 클릭 시 `updateNote` payload에 `tags`를 포함해야 한다
13. [정상] **fetchNotes** — API 응답에 `tags` 필드가 포함된 경우 그대로 보존해야 한다
14. [정상] **fetchNotes** — `tags`가 누락된 경우 `[]`로 기본값 처리해야 한다
15. [정상] **api/notes** — `updatedAt`은 오직 `src/api/notes.ts` 내부에서만 설정해야 한다 (태그 전용 헬퍼 없음)

### 경계

16. [경계] **useTagInput.commit** — 빈 초기 태그에 추가할 수 있어야 한다 (`[]` → "first" → `["first"]`)
17. [경계] **useTagInput.commit** — 앞뒤 공백을 trim해야 한다 (`"  work  "` → 태그 `"work"`)
18. [경계] **TagChipInput** — `tags`가 `[]`일 때 칩을 하나도 렌더링하지 않아야 한다
19. [경계] **NoteEditor** — 태그를 추가하지 않은 경우 `tags: []` payload로 정상 저장되어야 한다 (레거시 노트, 본문만 수정)

### 예외

20. [예외] **useTagInput.commit** — `input === ''`이면 아무 동작도 하지 않아야 한다 (tags 변경 없음)
21. [예외] **useTagInput.commit** — 입력이 공백 문자만 있을 때(`"   "`) `tags`는 변경되지 않고 `input`만 `''`로 리셋해야 한다
22. [예외] **useTagInput.handleKeyDown** — Enter가 아닌 키(예: `'a'`, `'Backspace'`, `','`)에서는 `commit()`을 호출하지 않아야 한다
23. [예외] **api/notes** — 태그 전용 API 함수를 도입하지 않아야 한다 (`addTag`/`removeTag`/`tag*` export 없음)

## AC 커버리지

| AC                                                  | 커버하는 시나리오    |
| --------------------------------------------------- | -------------------- |
| **AC-1** Note 타입 + 누락 → `[]` 처리               | #13, #14             |
| **AC-2** `useTagInput.ts` 5요소 반환                | #1, #2, #3, #4       |
| **AC-3** `TagChipInput`이 제목 아래 렌더            | #8, #11              |
| **AC-4** Enter로 trim 후 칩 확정, 빈 문자열 미확정  | #5, #6, #7, #17, #20 |
| **AC-5** 저장 시 `updateNote` payload에 `tags` 포함 | #12, #19             |
| **AC-6** `updatedAt`은 `api/notes.ts`만, 신규 API X | #15, #23             |

**이슈 본문 Given/When/Then 매핑**:

- 시나리오 1 (work 추가/저장) → #5, #12
- 시나리오 2 (레거시 노트 본문만 수정) → #14, #19
- 시나리오 3 (빈 입력 Enter) → #20
- 시나리오 4 (work + study 순서) → #6, #12

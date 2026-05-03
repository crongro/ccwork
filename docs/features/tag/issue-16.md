# Issue #16 — bug: 노트 저장 후 태그가 사라지는 문제

> 출처: GitHub Issue #16
> 관련 PRD: docs/features/tag/prd.md

## 시그니처

### 타입

변경 없음. `src/types/note.ts`의 `Note.tags: string[]`는 이미 존재.

### 함수/훅

```ts
// src/context/NotesContext.tsx — NotesContextType 인터페이스
interface NotesContextType {
  createNote: (title: string, content: string, tags: string[]) => Promise<void>;
  // 나머지 필드 변경 없음
}

// 구현 함수
async function createNote(title: string, content: string, tags: string[]): Promise<void>;
```

```ts
// src/components/NoteEditor.tsx — handleSave 내부 호출부
await createNote(title, content, [...tags]);
```

### 에러 케이스

- `tags` 미전달 → TypeScript 컴파일 타임 에러로 차단 (런타임 에러 없음)
- API 실패(`!res.ok`) → 기존 그대로 `Error('Failed to create note')` throw
- `tags`가 빈 배열(`[]`) → 정상 동작, 에러 없이 그대로 저장

### 컴포넌트 Props

변경 없음.

```ts
interface NoteEditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}
```

---

## 테스트 시나리오

테스트 파일: `src/components/NoteEditor.test.tsx`

### 정상

- [x] [정상] NoteEditor.handleSave — should call createNote with tags when new note is saved after typing a tag and pressing Enter in isCreating mode
- [x] [정상] NoteEditor.handleSave — should call createNote with empty array when new note is saved without adding any tags in isCreating mode

### 경계

- [x] [경계] NoteEditor.handleSave — should not call createNote when title is empty string in isCreating mode

### 예외

- [x] [예외] NoteEditor.handleSave — should not call updateNote when isCreating is true

## AC 커버리지

| AC                                 | 커버하는 시나리오                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| AC-1 (태그 있음 → createNote 전달) | [정상] should call createNote with tags when new note is saved after typing a tag  |
| AC-2 (태그 없음 → 빈 배열 전달)    | [정상] should call createNote with empty array when new note is saved without tags |

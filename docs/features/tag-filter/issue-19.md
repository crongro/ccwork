# Issue #19 — FILTER-2: NoteItem 태그 뱃지 + 하이라이트

> 출처: GitHub Issue #19
> 관련 PRD: docs/features/tag-filter/prd.md

## 시그니처

### 타입

```ts
// Note 타입 변경 없음 — tags: string[] 필드가 이미 존재
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[]; // 기존 필드
}
```

### 함수/훅

새로 추가되는 함수/훅 없음. `NoteItem` 컴포넌트에 props 추가 및 렌더링 로직 변경만 수행한다.

`NoteList`는 `selectedTag`를 `NoteItem`에 전달하기 위해 해당 prop을 추가로 받아야 한다:

```ts
// NoteList — selectedTag prop 추가
interface NoteListProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
  notes: Note[];
  selectedTag: string | null; // 추가
}
```

### 에러 케이스

- `note.tags`가 빈 배열(`[]`)이면 태그 뱃지 영역을 렌더링하지 않는다 (no-op).
- `selectedTag`가 `null`이면 카드 전체 하이라이트 없음 (no-op).
- `selectedTag`가 `null`이면 모든 뱃지가 기본 스타일을 유지한다 (no-op).
- `note.tags`에 `selectedTag`가 포함되지 않으면 카드 하이라이트 없음 (no-op).

### 컴포넌트 Props

```ts
interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedTag: string | null; // 추가 — 현재 필터 활성 태그
}
```

---

## 테스트 시나리오

### 정상

- [정상] NoteItem 태그 뱃지 — should render tag badges when note.tags is non-empty
- [정상] NoteItem 태그 뱃지 — should render all tags as individual badge elements
- [정상] NoteItem 카드 하이라이트 — should apply highlight style to card when selectedTag matches one of note.tags
- [정상] NoteItem 뱃지 하이라이트 — should apply highlight style only to the matched tag badge when selectedTag is set
- [정상] NoteItem 뱃지 기본 스타일 — should keep non-selected tag badges in default style when selectedTag is set

### 경계

- [경계] NoteItem 태그 뱃지 — should not render tag badge area when note.tags is empty array
- [경계] NoteItem 카드 하이라이트 — should not apply card highlight when selectedTag is null
- [경계] NoteItem 카드 하이라이트 — should not apply card highlight when selectedTag does not match any of note.tags
- [경계] NoteItem 뱃지 하이라이트 — should not highlight any badge when selectedTag is null
- [경계] NoteItem 태그 뱃지 — should render all badges in default style when selectedTag matches none of note.tags

### 예외

- [예외] NoteItem 태그 뱃지 — should render tag badges independently of isSelected (note selection state does not affect tag badge styles)

## AC 커버리지

| AC   | AC 내용                                                                                 | 커버하는 시나리오                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | 노트에 태그가 있을 때 카드가 렌더링되면 카드 하단에 태그 뱃지가 표시된다                | [정상] NoteItem 태그 뱃지 — should render tag badges when note.tags is non-empty<br>[정상] NoteItem 태그 뱃지 — should render all tags as individual badge elements<br>[경계] NoteItem 태그 뱃지 — should not render tag badge area when note.tags is empty array                                                                                                                                                                                        |
| AC-2 | 태그로 필터링 중일 때 해당 태그 달린 카드가 렌더링되면 카드 전체가 시각적으로 강조된다  | [정상] NoteItem 카드 하이라이트 — should apply highlight style to card when selectedTag matches one of note.tags<br>[경계] NoteItem 카드 하이라이트 — should not apply card highlight when selectedTag is null<br>[경계] NoteItem 카드 하이라이트 — should not apply card highlight when selectedTag does not match any of note.tags                                                                                                                     |
| AC-3 | 태그로 필터링 중일 때 선택된 태그 뱃지만 하이라이트되고 나머지는 기본 스타일을 유지한다 | [정상] NoteItem 뱃지 하이라이트 — should apply highlight style only to the matched tag badge when selectedTag is set<br>[정상] NoteItem 뱃지 기본 스타일 — should keep non-selected tag badges in default style when selectedTag is set<br>[경계] NoteItem 뱃지 하이라이트 — should not highlight any badge when selectedTag is null<br>[경계] NoteItem 태그 뱃지 — should render all badges in default style when selectedTag matches none of note.tags |

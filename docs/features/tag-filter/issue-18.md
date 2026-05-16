# Issue #18 — FILTER-1: 태그 목록 표시 + 필터링 MVP

> 출처: GitHub Issue #18  
> 관련 PRD: docs/features/tag-filter/prd.md

## 시그니처

### 타입

`Note` 타입에 이미 `tags: string[]`이 존재하므로 신규 타입 정의 없음.

### 함수/훅

```ts
// src/hooks/useTagFilter.ts
function useTagFilter(
  notes: Note[],
  selectedTag: string | null,
): {
  allTags: string[];
  filteredNotes: Note[];
};
```

### 에러 케이스

- `useTagFilter`는 순수 파생 계산 훅 — 에러를 throw하지 않는다.
- `selectedTag === null` → `filteredNotes` = 전체 notes (no-op).
- `selectedTag`가 어떤 노트에도 없는 태그 → `filteredNotes = []` (silent, no-op).
- 모든 notes의 `tags[]`가 비어있으면 → `allTags = []`.

### 컴포넌트 Props

```ts
// src/components/TagPanel.tsx (신규)
interface TagPanelProps {
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
}
```

```ts
// src/components/NoteList.tsx (변경)
interface NoteListProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
  notes: Note[]; // App에서 filteredNotes를 전달받음 (기존 내부 useNotes().notes 대체)
}
```

### App.tsx 상태 추가

```ts
const [selectedTag, setSelectedTag] = useState<string | null>(null);

const handleSelectTag = (tag: string) => {
  setSelectedTag((prev) => (prev === tag ? null : tag)); // 재클릭 시 해제
};
```

---

## 테스트 시나리오

### 정상

- [x] useTagFilter — should return all notes as filteredNotes when selectedTag is null
- [x] useTagFilter — should return only notes containing selectedTag when selectedTag is set
- [x] useTagFilter — should return deduplicated allTags collected from all notes
- [x] TagPanel — should render a chip for each tag in allTags
- [x] TagPanel — should call onSelectTag with the tag name when a chip is clicked
- [x] TagPanel — should visually mark the selectedTag chip as active
- [x] NoteList — should render notes passed via notes prop (not from context)
- [x] NoteList — should show empty state when notes prop is empty array

### 경계

- [x] useTagFilter — should return empty allTags when all notes have empty tags[]
- [x] useTagFilter — should return empty filteredNotes when selectedTag matches no note
- [x] useTagFilter — should handle notes with duplicate tags across multiple notes (dedup)
- [x] useTagFilter — should return all notes when notes array is empty
- [x] TagPanel — should render "태그 없음" when allTags is empty

### 예외

- [x] useTagFilter — should not throw when selectedTag is a tag that exists in no note
- [x] TagPanel — should call onSelectTag once per click (not bubble)

## AC 커버리지

| AC                                                         | 커버하는 시나리오                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| AC-1: 사이드바 상단에 중복 없는 태그 목록이 칩 형태로 표시 | [정상] useTagFilter — should return deduplicated allTags... + [정상] TagPanel — should render a chip for each tag...    |
| AC-2: 특정 태그 칩 클릭 → 해당 태그 달린 노트만 표시       | [정상] useTagFilter — should return only notes containing selectedTag... + [정상] TagPanel — should call onSelectTag... |
| AC-3: 선택된 태그 칩 재클릭 → 필터 해제, 전체 노트 표시    | [정상] useTagFilter — should return all notes as filteredNotes when selectedTag is null                                 |
| AC-4: 태그 없는 노트는 필터링 중 표시되지 않음             | [정상] useTagFilter — should return only notes containing selectedTag...                                                |
| AC-5: 모든 노트의 tags[]가 비어있으면 "태그 없음" 표시     | [경계] useTagFilter — should return empty allTags... + [경계] TagPanel — should render "태그 없음"...                   |

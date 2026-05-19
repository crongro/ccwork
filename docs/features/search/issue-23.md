# Issue #23 — SEARCH-1: 제목/본문 substring 검색 (debounce 200ms)

> 출처: GitHub Issue #23
> 관련 PRD: docs/features/search/prd.md

## 시그니처

### 타입

기존 `Note` 타입 그대로 사용. 신규 타입 없음.

### 함수/훅

```ts
// src/hooks/search/useNoteFilter.ts
import type { Note } from '../../types/note';

export function useNoteFilter(notes: Note[], query: string): Note[];
```

- `query`는 raw 문자열을 그대로 받음. 훅 내부에서 `trim().toLowerCase()` 정규화 수행.
- 정규화 결과가 빈 문자열이면 `notes`를 그대로 반환 (필터 비활성).
- 그 외에는 `notes.filter`로 `title`/`content`를 case-insensitive substring 매칭한 결과 반환.
- React state 미사용 — 순수 파생값. (useMemo는 구현 단계에서 판단)

### 에러 케이스

- `query`가 빈 문자열 → no-op (전체 notes 반환).
- `query`가 공백만 → no-op (정규화 후 빈 문자열로 간주).
- `notes`가 빈 배열 → 빈 배열 반환.
- 매칭 0건 → 빈 배열 반환.
- 예외 throw 없음. 클라이언트사이드 순수 함수.

### 컴포넌트 Props

```ts
// src/components/search/SearchBox.tsx
interface SearchBoxProps {
  onChange: (query: string) => void;
  debounceMs?: number; // default: 200
  placeholder?: string; // default: "검색"
}
```

- 내부 상태: `const [raw, setRaw] = useState('')` — 입력창 표시값.
- `raw`가 바뀌면 `debounceMs` 후 `onChange(raw)` 호출 (정규화는 훅에서 수행하므로 raw 그대로 전달).
- 빠르게 연속 입력 시 마지막 입력만 emit (cancel previous timeout).
- 언마운트 시 pending timeout 정리.

### App.tsx 변경

```ts
const [query, setQuery] = useState('');
const filteredNotes = useNoteFilter(notes, query);
// SearchBox는 NoteList 위에 렌더, onChange={setQuery}
```

이 이슈에서는 태그 필터를 무시 — `useTagFilter`를 일시 우회하고 `useNoteFilter` 결과만 NoteList에 전달. (SEARCH-2에서 결합)

---

## 테스트 시나리오

### 정상

- [x] useNoteFilter — should return notes whose title includes query (case-insensitive)
- [x] useNoteFilter — should return notes whose content includes query (case-insensitive)
- [x] useNoteFilter — should match across both title and content fields
- [x] SearchBox — should call onChange with input value after debounce delay
- [x] SearchBox — should render input element with placeholder text

### 경계

- [x] useNoteFilter — should return all notes when query is empty string
- [x] useNoteFilter — should return all notes when query is whitespace only (" ")
- [x] useNoteFilter — should return empty array when notes is empty
- [x] useNoteFilter — should return empty array when no note matches
- [x] useNoteFilter — should trim query before matching (leading/trailing spaces)
- [x] SearchBox — should debounce rapid input and call onChange only once with latest value
- [x] SearchBox — should clear pending timeout on unmount

### 예외

- [x] useNoteFilter — should not throw when notes contain empty title or content
- [x] SearchBox — should not call onChange before debounce delay elapses

---

## AC 커버리지

| AC                                                                        | 커버하는 시나리오                                                                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| AC-1: title "회의" 매칭, "회의록"만 표시                                  | [정상] useNoteFilter — title includes query / [정상] SearchBox — debounce 후 onChange                       |
| AC-2: content "TODO" case-insensitive 매칭                                | [정상] useNoteFilter — content includes query (case-insensitive)                                            |
| AC-3: 검색어 비우면 200ms 후 전체 복원                                    | [경계] useNoteFilter — empty query returns all / [경계] SearchBox — debounce after change                   |
| AC-4: 공백만 입력 → 전체 표시                                             | [경계] useNoteFilter — whitespace-only query returns all                                                    |
| AC-5: 노트 0개 + 임의 키워드 → "노트가 없습니다"                          | [경계] useNoteFilter — empty notes returns empty (NoteList 기존 empty state로 자동)                         |
| AC-6: 매치 없음 → "노트가 없습니다"                                       | [경계] useNoteFilter — no match returns empty (NoteList 기존 empty state)                                   |
| AC-7: useNoteFilter 단위 테스트 — 빈/공백/대소문자/title/content/매치없음 | [정상] title/content/case-insensitive (3개) + [경계] empty/whitespace/no-match (3개) — 6개 케이스 모두 커버 |

## [GATE 1·2] 자체 승인

자동주행 모드. 시그니처 4요소 완비, 모든 AC가 1개 이상 시나리오로 매핑됨. 다음 단계(tdd-red)로 진행.

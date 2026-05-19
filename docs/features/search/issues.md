# Search 이슈 목록

PRD: `docs/features/search/prd.md`
모두 수직 슬라이스. 각 이슈 완료 시 사용자가 동작을 확인할 수 있다.

---

## SEARCH-1: 제목/본문 substring 검색 (debounce 200ms)

**의존성**: 없음

### 설명

사이드바 NoteList 상단에 `SearchBox`를 추가한다. 사용자가 입력하면 200ms debounce 후
정규화 검색어로 `title`/`content`를 substring(case-insensitive) 매칭하여 결과만 NoteList에 표시한다.
검색어가 비어있으면 전체 노트를 표시한다 (필터 비활성).

태그 필터는 이번 이슈 범위에서 무시(태그가 선택되어 있어도 검색 결과는 검색어만 반영). 결합은 SEARCH-2에서.

### 변경/추가 파일

- `src/components/search/SearchBox.tsx` (신규) — `<input type="search">` + 로컬 raw state + 200ms debounce → `onChange(normalized: string)`
- `src/hooks/search/useNoteFilter.ts` (신규) — 시그니처: `(notes: Note[], query: string) => Note[]`
- `src/App.tsx` — `query` state 추가, `SearchBox` 렌더, NoteList에 필터링된 notes 전달

### Acceptance Criteria

- [ ] **Given** 노트 3개(`title`: ["회의록", "쇼핑목록", "독서노트"], `content`: 임의), **When** 검색창에 "회의" 입력 후 200ms 경과, **Then** "회의록"만 NoteList에 표시된다.
- [ ] **Given** 노트 1개(`title`: "Note", `content`: "TODO: 책 사기"), **When** 검색창에 "todo" 입력 후 200ms 경과, **Then** 해당 노트가 표시된다 (대소문자 무시 확인).
- [ ] **Given** 노트 N개와 검색어 "회의"가 적용된 상태, **When** 검색창을 빈 문자열로 비움, **Then** 200ms 후 전체 노트 N개가 다시 표시된다.
- [ ] **Given** 노트 2개, **When** 검색창에 공백만 입력 (" "), **Then** 검색 필터가 비활성되어 전체 노트가 표시된다 (정규화로 빈 검색어 취급).
- [ ] **Given** 노트 0개 상태, **When** 검색창에 임의 키워드 입력, **Then** NoteList의 기존 "노트가 없습니다" empty state가 표시된다.
- [ ] **Given** 검색어와 일치하는 노트가 없음, **When** 입력 후 200ms 경과, **Then** "노트가 없습니다" 표시.
- [ ] **단위 테스트**: `useNoteFilter(notes, query)` — 빈 query / 공백 query / 대소문자 / title 매치 / content 매치 / 매치 없음 케이스 통과.

---

## SEARCH-2: 검색 × 태그 필터 AND 결합

**의존성**: Depends on SEARCH-1

### 설명

태그 필터(`selectedTag`)와 검색 필터를 AND로 결합한다. 두 조건 모두 만족하는 노트만 표시.
`useNoteFilter`를 `(notes, { query, selectedTag })` 시그니처로 확장하고, 내부에서 기존 `useTagFilter`의 `filteredNotes`를 활용하거나 동등 로직을 합성한다.

### 변경 파일

- `src/hooks/search/useNoteFilter.ts` — 시그니처 확장: `(notes, { query, selectedTag })` → `{ allTags, filteredNotes }`. (allTags는 원본 notes에서 집계하여 태그가 결과 0건이어도 사이드바에서 사라지지 않게 한다.)
- `src/App.tsx` — `useTagFilter` 호출을 `useNoteFilter` 호출로 대체, `query`도 함께 전달.

### Acceptance Criteria

- [ ] **Given** 노트 [{title:"회의", tags:["work"]}, {title:"회의", tags:["personal"]}, {title:"독서", tags:["work"]}], **When** 태그 "work" 선택 + 검색어 "회의" 입력 후 200ms 경과, **Then** 첫 번째 노트만 표시된다 (둘 다 만족).
- [ ] **Given** 위와 동일 노트, **When** 태그 "work"만 선택 (검색어 빈 문자열), **Then** "work" 태그 가진 2개 표시 (검색 필터 비활성).
- [ ] **Given** 위와 동일 노트, **When** 태그 미선택 + 검색어 "회의", **Then** "회의" 제목 가진 2개 표시 (태그 필터 비활성).
- [ ] **Given** AND 결합으로 결과가 0건, **When** 입력 후 200ms 경과, **Then** "노트가 없습니다" 표시 + TagPanel의 태그 목록은 그대로 유지(원본 기준 집계).
- [ ] **단위 테스트**: `useNoteFilter(notes, { query, selectedTag })` — 둘 다 활성 / 태그만 / 검색만 / 둘 다 비활성 / 결과 0건 케이스 통과.
- [ ] **회귀**: 기존 tag-filter 단위/통합 테스트가 모두 통과한다.

---

## 의존성 그래프

```
SEARCH-1 (단독 사용자 동작 — 검색만)
   ↓
SEARCH-2 (검색 + 태그 AND 결합)
```

각 이슈가 머지되면 사용자가 즉시 새로운 동작을 확인할 수 있다 (수직 슬라이스 만족).

## [GATE 3] 자체 승인

- 두 이슈 모두 수직 슬라이스. AC는 Given-When-Then으로 구체적. 의존성 명시. → 통과

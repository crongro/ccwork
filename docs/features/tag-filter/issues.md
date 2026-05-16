# Tag Filter — 이슈 목록

관련 PRD: `docs/features/tag-filter/prd.md`

---

## FILTER-1: 태그 목록 표시 + 필터링 MVP

**범위**

- `useTagFilter(notes, selectedTag)` 커스텀 훅 신규 작성
- `TagPanel` 컴포넌트 신규 작성 (사이드바 상단 태그 칩 목록)
- `App.tsx`에 `selectedTag: string | null` 상태 추가
- `NoteList`가 `filteredNotes`를 받아 렌더링 (태그 없는 노트 숨김 포함)

**Acceptance Criteria**

- [ ] Given 여러 태그가 달린 노트들이 있을 때, When 앱을 열면, Then 사이드바 상단에 중복 없는 태그 목록이 칩 형태로 표시된다
- [ ] Given 태그 칩이 표시된 상태에서, When 특정 태그 칩을 클릭하면, Then 해당 태그가 달린 노트만 목록에 표시된다
- [ ] Given 태그로 필터링 중일 때, When 선택된 태그 칩을 다시 클릭하면, Then 필터가 해제되고 전체 노트가 다시 표시된다
- [ ] Given 태그로 필터링 중일 때, When 태그가 없는 노트가 있으면, Then 해당 노트는 목록에 표시되지 않는다
- [ ] Given 모든 노트의 tags[]가 비어있을 때, When 앱을 열면, Then 태그 영역에 "태그 없음"이 표시된다

**의존성**: 없음 (MVP 이슈)

---

## FILTER-2: NoteItem 태그 뱃지 + 하이라이트

**범위**

- `NoteItem`에 태그 뱃지 렌더링 추가 (tags[] → chip 목록)
- `selectedTag` prop 전달 → 일치하는 카드 전체 강조
- 카드 내 선택된 태그 뱃지만 하이라이트, 나머지는 기본 스타일

**Acceptance Criteria**

- [ ] Given 노트에 태그가 있을 때, When 카드가 렌더링되면, Then 카드 하단에 태그 뱃지가 표시된다
- [ ] Given 태그로 필터링 중일 때, When 해당 태그가 달린 카드가 렌더링되면, Then 카드 전체가 시각적으로 강조된다
- [ ] Given 태그로 필터링 중일 때, When 카드 내 태그 뱃지가 렌더링되면, Then 선택된 태그 뱃지만 하이라이트되고 나머지는 기본 스타일을 유지한다

**의존성**: Depends on FILTER-1

---

## 수직 슬라이싱 검증

| 이슈     | "이 이슈만 완료하면 사용자에게 보여줄 동작이 있는가?"   |
| -------- | ------------------------------------------------------- |
| FILTER-1 | ✅ 사이드바에 태그 칩 노출 + 클릭 필터링 동작 확인 가능 |
| FILTER-2 | ✅ 카드에 태그 뱃지 표시 + 선택 태그 강조 확인 가능     |

## 의존성 순서

```
FILTER-1 (useTagFilter + TagPanel + selectedTag + NoteList 필터링)
    ↓
FILTER-2 (NoteItem 뱃지 + 하이라이트)
```

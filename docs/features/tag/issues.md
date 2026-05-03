# 태그 기능 이슈 분해

본 문서는 `docs/features/tag/prd.md`를 기반으로, **수직 슬라이싱(Vertical Slicing)** 원칙에 따라 태그 기능을 엔드투엔드로 동작하는 얇은 슬라이스 단위로 분해한 이슈 목록이다.

- 각 이슈는 **타입/훅/컴포넌트/API 계층을 모두 관통**해 단독으로 머지·배포 가능해야 한다.
- 각 이슈 완료 시점에 사용자가 체감할 수 있는 가치가 존재한다(부분 기능이라도 "쓸 수 있는" 상태).
- 이슈 간 의존 순서는 `TAG-1 → TAG-2 → TAG-3 → TAG-4` 를 권장하되, `TAG-2`와 `TAG-3`은 병렬 진행 가능하다.

## 이슈 목록 요약

| #     | 제목                                           | 관련 US     | 의존  |
| ----- | ---------------------------------------------- | ----------- | ----- |
| TAG-1 | 태그 추가·저장 MVP 파이프라인                  | US-1, US-4  | —     |
| TAG-2 | 태그 삭제 (× 버튼 / Backspace)                 | US-2        | TAG-1 |
| TAG-3 | 태그 입력 검증 규칙 (trim·중복·길이·개수)      | US-1 (검증) | TAG-1 |
| TAG-4 | 태그 UX 보강 (placeholder·쉼표 확정·노트 전환) | US-3, US-1  | TAG-1 |

---

## TAG-1. 태그 추가·저장 MVP 파이프라인

### 설명

노트에 태그를 **추가하고 저장**하는 가장 얇은 엔드투엔드 파이프라인을 구축한다. 타입 정의부터 저장소 반영까지 모든 계층을 관통하지만, UI·검증·삭제는 최소 범위로 제한한다.

- `Note` 타입에 `tags: string[]` 필드를 추가하고 기본값을 `[]`로 보장한다.
- `useTagInput` 훅의 최소 골격(`tags`, `input`, `setInput`, `commit`, `handleKeyDown`)을 작성한다.
- presentational `TagChipInput`을 `NoteEditor` 제목과 본문 사이에 배치한다.
- `Enter` 키로 입력값을 칩으로 확정하고, 저장 시 `updateNote` payload에 `tags`가 포함된다.
- 이번 슬라이스에서는 `trim` 외 검증(중복/길이/개수)은 다루지 않는다.

### 완료 조건 (Acceptance Criteria)

- **AC-1**: `Note` 타입에 `tags: string[]` 필드가 추가되어 있고, 기존 노트 로드 시 `tags`가 누락되어도 런타임에서 `[]`로 처리된다.
- **AC-2**: `src/hooks/useTagInput.ts`에 훅이 존재하며 `tags`, `input`, `setInput`, `commit`, `handleKeyDown`을 반환한다.
- **AC-3**: `NoteEditor`의 제목 바로 아래에 `TagChipInput`이 렌더링된다.
- **AC-4**: 입력란에 텍스트를 입력하고 `Enter`를 누르면 해당 문자열이 칩으로 확정되고 input은 비워진다. (`trim()`은 적용, 빈 문자열은 확정되지 않음)
- **AC-5**: "저장" 동작 시 기존 `updateNote(id, updates)` 호출에 `tags` 필드가 포함되어 서버(`db.json`)에 반영된다.
- **AC-6**: `updatedAt`은 기존 규칙대로 `src/api/notes.ts`에서만 세팅되며, 태그 전용 API는 추가되지 않는다.

### 시나리오 (Given / When / Then)

**Given** `tags`가 비어 있는 노트가 편집 화면에 열려 있고,  
**When** 사용자가 태그 입력란에 `work`를 입력한 뒤 `Enter`를 누르고 저장 버튼을 클릭하면,  
**Then** 화면에 `work` 칩이 표시되고, 서버의 해당 노트 문서가 `tags: ["work"]`로 갱신된다.

**Given** 기존에 `tags`가 없는 레거시 노트를 편집 화면에서 열고,  
**When** 별도 태그를 추가하지 않고 본문만 수정한 뒤 저장하면,  
**Then** 정상적으로 저장되며 해당 노트의 `tags`는 `[]`로 저장되거나 생략되어도 앱에서 `[]`로 취급된다.

**Given** 입력란이 비어 있고,  
**When** 사용자가 `Enter`를 누르면,  
**Then** 칩이 추가되지 않고 `tags` 배열은 변하지 않는다.

**Given** 편집 중인 노트의 `tags`가 `["work"]`인 상태에서,  
**When** 사용자가 태그 입력란에 `study`를 입력한 뒤 `Enter`를 누르고 저장 버튼을 클릭하면,  
**Then** 화면에 `work`, `study` 두 칩이 순서대로 표시되고, 서버의 해당 노트 문서가 `tags: ["work", "study"]`로 갱신된다.

---

## TAG-2. 태그 삭제 (× 버튼 / Backspace)

### 설명

이미 확정된 태그 칩을 제거하는 두 가지 경로를 제공한다.

- 칩 hover 시 × 버튼을 노출하고, 클릭 시 해당 태그를 즉시 제거한다.
- input이 비어 있는 상태에서 `Backspace` 입력 시 마지막 칩을 삭제한다.
- `useTagInput` 훅에 `removeTag(tag)` 핸들러를 추가하고, `handleKeyDown`에서 Backspace 분기를 처리한다.

### 완료 조건 (Acceptance Criteria)

- **AC-1**: 칩은 기본 상태에서 × 버튼이 시각적으로 숨겨져 있고, hover 시에만 노출된다 (CSS로 제어).
- **AC-2**: × 버튼 클릭 시 해당 태그가 `tags` 배열에서 즉시 제거된다.
- **AC-3**: input이 빈 상태에서 `Backspace`를 누르면 마지막 칩이 제거된다.
- **AC-4**: input에 문자가 있는 상태에서의 `Backspace`는 기존 텍스트 편집 동작만 수행하고 칩을 건드리지 않는다.
- **AC-5**: 삭제 결과가 `handleSave` 호출 시 `updateNote` payload의 `tags`에 반영된다.
- **AC-6**: `useTagInput`의 `removeTag`는 `renderHook` 기반 단위 테스트로 검증된다.

### 시나리오 (Given / When / Then)

**Given** 편집 중인 노트에 `["work", "study", "idea"]` 태그가 있고,  
**When** 사용자가 `study` 칩 위에 마우스를 올려 × 버튼을 클릭하면,  
**Then** 화면에는 `work`, `idea` 두 칩만 남고, 저장 시 서버의 `tags`도 `["work", "idea"]`로 갱신된다.

**Given** 입력란이 비어 있고 태그가 `["work", "study"]`인 상태에서,  
**When** 사용자가 `Backspace`를 누르면,  
**Then** `study` 칩이 제거되어 `tags`는 `["work"]`가 된다.

**Given** 입력란에 `hel`이 입력되어 있고 태그가 `["work"]`인 상태에서,  
**When** 사용자가 `Backspace`를 누르면,  
**Then** input 텍스트가 `he`로 바뀔 뿐 `tags`는 변하지 않는다.

---

## TAG-3. 태그 입력 검증 규칙 (trim·중복·길이·개수)

### 설명

PRD ADR-4에 따라 모든 검증 규칙을 **입력 시점에 `useTagInput` 훅 내부에서 차단**한다. 상태 불변식 "`tags`는 항상 유효하다"를 보장하고, 저장 시 재검증은 하지 않는다.

- `trim()` 후 빈 문자열은 확정 무시.
- 대소문자 무시 비교로 중복 태그는 무시(에러 메시지 없음, input만 비움).
- 태그 1개당 최대 15자: `onChange` 단계에서 하드 차단(길이 초과 입력값은 반영하지 않음).
- 노트당 최대 10개: `isFull` 상태를 노출하고, `commit()`은 `isFull`이면 no-op.

### 완료 조건 (Acceptance Criteria)

- **AC-1**: `useTagInput(initialTags, { maxTags: 10, maxLen: 15 })` 시그니처로 옵션을 받는다.
- **AC-2**: `setInput`(또는 input `onChange`) 단계에서 길이가 15를 초과하는 값은 상태에 반영되지 않는다.
- **AC-3**: `commit()` 호출 시 `trim()` 결과가 빈 문자열이면 `tags`에 추가되지 않고 input만 비워진다.
- **AC-4**: 대소문자만 다른 중복 태그(`Work` ↔ `work`)는 추가되지 않고 input만 비워지며, 화면에 에러 메시지가 표시되지 않는다.
- **AC-5**: `tags.length === 10`일 때 훅의 `isFull`이 `true`이고, 이 상태에서 `commit()`은 no-op이며 입력란이 disabled(또는 동등한 시각적 상태)로 전환된다.
- **AC-6**: 위 4가지 규칙이 각각 `renderHook` 단위 테스트로 커버된다.
- **AC-7**: 컴포넌트에서 `setTags`를 직접 호출할 수 없도록 훅이 `tags`를 읽기 전용으로만 노출한다(규칙 우회 불가).

### 시나리오 (Given / When / Then)

**Given** 입력란이 비어 있고,  
**When** 사용자가 스페이스만 입력한 뒤 `Enter`를 누르면,  
**Then** `tags`는 변하지 않고 input만 비워진다.

**Given** `tags`가 `["work"]`인 상태에서,  
**When** 사용자가 `Work`를 입력한 뒤 `Enter`를 누르면,  
**Then** `tags`는 그대로 `["work"]`이고 input만 비워지며 별도 에러 메시지는 표시되지 않는다.

**Given** 입력란에 14자가 입력된 상태에서,  
**When** 사용자가 2자를 연속으로 더 입력하려 하면,  
**Then** 15번째 문자까지만 반영되고 16번째 입력은 무시된다.

**Given** 현재 노트의 `tags`에 이미 10개의 태그가 존재하고,  
**When** 사용자가 새 태그를 입력해 `Enter`를 누르면,  
**Then** 새 태그는 추가되지 않고 훅의 `isFull`이 `true`이며 입력란은 비활성화 상태로 보인다.

---

## TAG-4. 태그 UX 보강 (placeholder·쉼표 확정·노트 전환 동기화)

### 설명

핵심 기능은 완성되었지만, PRD에서 명시한 보조 UX 세 가지를 마감한다.

- 쉼표(`,`) 키로도 태그를 확정할 수 있게 `handleKeyDown`에 분기를 추가한다.
- 태그가 0개일 때 input에 placeholder `태그 입력 후 Enter`를 표시한다.
- 선택된 노트가 바뀌었을 때 훅이 외부 `tags`와 동기화될 수 있도록 `reset(nextTags)`를 노출하고, `NoteEditor`에서 선택 노트 변경 시 호출한다.

### 완료 조건 (Acceptance Criteria)

- **AC-1**: 입력란에서 `,` 키를 누르면 `Enter`와 동일하게 현재 입력값이 칩으로 확정되며, 칩 텍스트에는 쉼표가 포함되지 않는다.
- **AC-2**: 해당 노트의 `tags`가 0개인 경우 input에 placeholder `태그 입력 후 Enter`가 표시된다.
- **AC-3**: 태그가 1개 이상이면 placeholder는 표시되지 않는다.
- **AC-4**: `useTagInput`에 `reset(nextTags: string[])`이 노출되어 있고, `NoteEditor`는 선택된 노트가 바뀔 때 `reset`으로 훅 상태를 새 노트의 `tags`로 동기화한다.
- **AC-5**: 노트 A에서 입력 중이던 텍스트가 남은 상태로 노트 B를 선택하면, 노트 B의 태그가 표시되고 입력란은 비워진다.
- **AC-6**: 노트 목록(`NoteItem`)에는 여전히 태그를 표시하지 않는다(스코프 외 유지).

### 시나리오 (Given / When / Then)

**Given** 입력란에 `todo`가 입력된 상태에서,  
**When** 사용자가 `,` 키를 누르면,  
**Then** `todo` 칩이 확정되고 input은 비워지며, 칩 텍스트는 `todo`(쉼표 없음)이다.

**Given** 편집 중인 노트의 `tags`가 비어 있고,  
**When** 사용자가 편집 화면을 열면,  
**Then** 태그 입력란에 `태그 입력 후 Enter` placeholder가 보인다.

**Given** 노트 A(`tags: ["alpha"]`)가 열려 있고 입력란에 `draft`가 입력된 상태에서,  
**When** 사용자가 사이드바에서 노트 B(`tags: ["beta", "gamma"]`)를 선택하면,  
**Then** 편집 화면에 `beta`, `gamma` 칩만 보이고 입력란은 비어 있으며, 노트 A에 `draft`가 칩으로 잘못 저장되지 않는다.

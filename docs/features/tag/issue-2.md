# Issue #2 — TAG-2: 태그 삭제 (× 버튼 / Backspace)

> 출처: GitHub Issue #2
> 관련 PRD: docs/features/tag/prd.md
> 의존: TAG-1 (Issue #1)

## 시그니처

### 타입

변경 없음. `Note.tags: string[]`은 TAG-1에서 추가됨.

### 함수/훅

```ts
// src/hooks/useTagInput.ts — 기존 반환값에 removeTag 추가
function useTagInput(initialTags: string[]): {
  tags: readonly string[];
  input: string;
  setInput: (value: string) => void;
  commit: () => void;
  removeTag: (tag: string) => void; // ← 추가
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void; // ← Backspace 분기 추가
};
```

- 이슈 본문: `removeTag(tag)` 핸들러 추가 + `handleKeyDown`에 Backspace 분기.
- `tag: string` 값으로 식별. PRD ADR-4가 중복(대소문자 무시)을 입력 시점에 차단하므로 같은 문자열이 두 번 들어올 수 없어 안전.
- `reset` / `isFull` / options는 TAG-3/4 슬라이스로 미룬다 (TAG-1과 동일한 점진 노출 방침).

```ts
// src/api/notes.ts — 변경 없음
async function updateNote(id: string, updates: Partial<Note>): Promise<Note>;
```

- ADR-2 — 태그 도메인 액션을 Context에 추가하지 않음. 기존 `updateNote`만 사용.

### 에러 케이스

| 위치             | 입력                                                             | 동작                                                                     |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `removeTag(tag)` | `tags`에 존재하는 `tag`                                          | 해당 태그 1개를 제거한 새 배열로 갱신                                    |
| `removeTag(tag)` | `tags`에 없는 `tag` (`""`, 미존재 문자열)                        | no-op (예외 던지지 않음)                                                 |
| `handleKeyDown`  | `e.key === 'Backspace'` && `input === ''` && `tags.length > 0`   | 마지막 태그 1개 제거                                                     |
| `handleKeyDown`  | `e.key === 'Backspace'` && `input !== ''`                        | no-op. `preventDefault` 호출하지 않음 — 브라우저 기본 텍스트 편집에 위임 |
| `handleKeyDown`  | `e.key === 'Backspace'` && `input === ''` && `tags.length === 0` | no-op                                                                    |
| `handleKeyDown`  | `Enter` / 그 외 키                                               | TAG-1 동작 유지                                                          |

### 컴포넌트 Props

```ts
// src/components/TagChipInput.tsx — onRemove 추가
interface TagChipInputProps {
  tags: readonly string[];
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void; // ← 추가
}
```

- AC-2 처리를 위한 콜백. 네이밍은 기존 `on*` 컨벤션과 일관.
- 칩 내부에 × `<button aria-label="태그 삭제">`를 둔다. Hover 노출은 **CSS만으로** 제어 (`group` / `group-hover:opacity-100` 패턴) — AC-1 "CSS로 제어" 명시 준수.

```ts
// src/components/NoteEditor.tsx — Props 시그니처 변경 없음
interface NoteEditorProps {
  selectedNoteId: string | null;
  isCreating: boolean;
  onDone: () => void;
}
```

- 내부 변경만: `useTagInput()` 반환에서 `removeTag`를 destructure해 `<TagChipInput onRemove={removeTag} />`로 연결. `handleSave`의 `updateNote` payload는 TAG-1과 동일(`tags: [...tags]`).

---

## 테스트 시나리오

### 정상

<!-- prettier-ignore -->
1. [x] [정상] **useTagInput** — 초기화 시 `removeTag`를 노출해야 한다 (반환 객체에 함수 존재)
2. [x] [정상] **useTagInput.removeTag** — `tags`에 존재하는 태그를 제거해야 한다 (`["work","study","idea"]` + `removeTag("study")` → `["work","idea"]`)
3. [x] [정상] **useTagInput.removeTag** — 다른 태그들의 순서를 유지해야 한다
4. [x] [정상] **useTagInput.handleKeyDown** — `input === ''` && `tags.length > 0` 상태에서 `Backspace`를 누르면 마지막 태그를 제거해야 한다 (`["work","study"]` → `["work"]`)
5. [x] [정상] **TagChipInput** — 각 칩에 `aria-label="태그 삭제"` × 버튼을 렌더링해야 한다
6. [x] [정상] **TagChipInput** — × 버튼 클릭 시 해당 태그 문자열과 함께 `onRemove`를 호출해야 한다
7. [x] [정상] **TagChipInput** — × 버튼은 hover 시에만 노출되도록 CSS 클래스(`group-hover:opacity-100` + 기본 `opacity-0`)를 가져야 한다
8. [x] [정상] **NoteEditor** — 칩의 × 버튼 클릭 후 저장하면 `updateNote` payload의 `tags`에서 해당 태그가 제거되어야 한다 (이슈 본문 시나리오 1 통합: `["work","study","idea"]` → `["work","idea"]`)
9. [x] [정상] **NoteEditor** — input이 빈 상태에서 `Backspace`를 누른 뒤 저장하면 `updateNote` payload의 `tags`에서 마지막 태그가 제거되어야 한다 (이슈 본문 시나리오 2 통합: `["work","study"]` → `["work"]`)

### 경계

<!-- prettier-ignore -->
10. [x] [경계] **useTagInput.removeTag** — 남은 마지막 1개 태그를 제거해 `tags`를 `[]`로 만들 수 있어야 한다
11. [x] [경계] **useTagInput.handleKeyDown** — `tags === []` && `input === ''` 상태에서 `Backspace`는 no-op이어야 한다 (예외 없이)
12. [x] [경계] **NoteEditor** — 모든 태그를 제거 후 저장하면 `updateNote` payload에 `tags: []`가 포함되어야 한다

### 예외

<!-- prettier-ignore -->
13. [x] [예외] **useTagInput.removeTag** — `tags`에 없는 문자열을 인자로 주면 `tags`가 변경되지 않고 예외도 던지지 않아야 한다
14. [x] [예외] **useTagInput.handleKeyDown** — `input !== ''`인 상태에서 `Backspace`는 `tags`를 변경하지 않아야 한다 (이슈 본문 시나리오 3 통합)
15. [x] [예외] **useTagInput.handleKeyDown** — `input !== ''`인 상태에서 `Backspace`는 `e.preventDefault`를 호출하지 않아야 한다 (브라우저 기본 텍스트 편집 위임)
16. [x] [예외] **useTagInput.handleKeyDown** — `Backspace` 외 키(예: `'a'`, `'Delete'`, `'ArrowLeft'`)에서는 마지막 태그를 제거하지 않아야 한다

## AC 커버리지

| AC                                                  | 커버하는 시나리오    |
| --------------------------------------------------- | -------------------- |
| **AC-1** × 버튼 hover 시에만 노출 (CSS 제어)        | #5, #7               |
| **AC-2** × 클릭 시 즉시 제거                        | #2, #6, #8           |
| **AC-3** 빈 input + Backspace → 마지막 칩 제거      | #4, #9, #11          |
| **AC-4** input에 텍스트 있을 때 Backspace는 칩 무관 | #14, #15             |
| **AC-5** 삭제 결과가 `updateNote` payload에 반영    | #8, #9, #12          |
| **AC-6** `removeTag`는 `renderHook` 단위 테스트     | #1, #2, #3, #10, #13 |

**이슈 본문 Given/When/Then 매핑**:

- 시나리오 1 (× 클릭으로 study 제거 → 저장 payload 갱신) → #6, #8
- 시나리오 2 (빈 input + Backspace로 study 제거) → #4, #9
- 시나리오 3 (input "hel" 상태 Backspace, tags 변경 없음) → #14, #15

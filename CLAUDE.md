# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 앱 실습 프로젝트. JSON Server를 로컬 REST API 백엔드로 사용한다.

- 앱: http://localhost:5173
- API: http://localhost:3001/notes

## 주요 명령어

```bash
npm run dev        # Vite + JSON Server 동시 실행 (concurrently)
npm run server     # JSON Server만 단독 실행
npm run build      # tsc + vite build
npm run lint       # ESLint --fix
npm run format     # Prettier --write
npm test           # vitest run (1회 실행)
npm run test:watch # vitest (watch 모드)
npm run test:e2e   # Playwright E2E (webServer가 dev 서버 자동 기동)
```

## 아키텍처

```
src/
├── types/note.ts          # Note 인터페이스 (id, title, content, tags[], createdAt, updatedAt)
├── api/notes.ts           # fetch 기반 CRUD 함수 (API_URL=http://localhost:3001)
├── context/NotesContext.tsx  # 전역 상태: notes[], loading, error + addNote/editNote/removeNote
├── components/
│   ├── Layout.tsx         # sidebar + main 슬롯을 받는 레이아웃
│   ├── note/              # NoteList / NoteItem / NoteEditor
│   └── tag/               # TagPanel (사이드바 칩) / TagChipInput (에디터 입력)
├── hooks/
│   └── tag/               # useTagFilter (집계+필터) / useTagInput (입력 로직)
└── App.tsx                # selectedNoteId, isCreating, selectedTag 상태 — NotesProvider 루트
```

**데이터 흐름**: `App` → `NotesProvider`(Context) → 컴포넌트. 모든 API 호출은 `context/NotesContext.tsx`에서만 수행하고, 컴포넌트는 `useNotes()` 훅을 통해 데이터에 접근한다.

**백엔드**: `db.json`이 JSON Server의 데이터 소스. `src/api/notes.ts`는 순수 fetch 함수만 포함하며, 타임스탬프(`createdAt`, `updatedAt`) 세팅도 여기서 처리한다.

## 구현 패턴

### 컴포넌트

- **named export** 사용 (`export function ComponentName`). `App.tsx`만 예외적으로 default export.
- Props 타입은 컴포넌트 바로 위에 `interface ${ComponentName}Props`로 정의하고 파라미터에서 직접 destructuring.
- 상태에 따른 early return(loading, error, empty)을 JSX 앞에 배치.

### 상태 관리 (3계층 분리)

| 계층         | 위치           | 내용                                          |
| ------------ | -------------- | --------------------------------------------- |
| 서버 상태    | `NotesContext` | `notes[]`, `loading`, `error`                 |
| UI 상태      | `App.tsx`      | `selectedNoteId`, `isCreating`, `selectedTag` |
| 폼 로컬 상태 | `NoteEditor`   | `title`, `content`, `saving`                  |

컴포넌트는 직접 API를 호출하지 않는다. 반드시 `useNotes()` 훅을 통해 Context 함수를 사용한다.

### API 호출

- `src/api/notes.ts`는 순수 fetch 함수만 담는다. 상태 변경 없음.
- 에러 처리: `!res.ok`이면 `throw new Error(메시지)`.
- Context에서 API 호출 후 응답값으로 `setNotes`를 즉시 갱신 (낙관적 업데이트 없음).

### 네이밍

- 이벤트 핸들러 prop: `on` + PascalCase (`onSelect`, `onDelete`, `onDone`)
- 이벤트 핸들러 함수: `handle` + PascalCase (`handleSave`, `handleSelectNote`)
- boolean prop: `is` + PascalCase (`isSelected`, `isCreating`)
- API 함수: `fetchNotes`, `createNote`, `updateNote`, `deleteNote`
- Context 노출 함수: `createNote`, `updateNote`, `deleteNote` (API와 동일 동사)

---

## ⚠️ 발견된 불일치 패턴

- **useEffect 의존성 누락**: `NoteEditor`의 useEffect가 `selectedNote`를 의존성에서 제외하고 `eslint-disable` 주석으로 억제 중 (`NoteEditor.tsx:27`).

---

## 디자인 시스템

모든 스타일/UI 작업은 **`design-system` skill을 반드시 호출**해서 진행한다.

- 상세 스펙: `docs/design-system/` (토큰, 컴포넌트, Do/Don't 파일 분할)
- 핵심 원칙: **No-Line** (border 금지, 톤 시프트), **Tonal Layering** (shadow 대신 surface 계층), **Inter 단일 폰트**.

**작업 순서**

1. `docs/design-system/dont.md` 먼저 읽어 금지 패턴 파악
2. 작업 대상(색/폰트/간격/컴포넌트)에 맞는 토큰 파일만 선택적으로 Read
3. 구현 — 임의의 HEX·px 값 대신 토큰 사용
4. `docs/design-system/do.md` 체크리스트로 자가 리뷰

**Hook 검사**

`.ts(x)/.js(x)/.css/.scss` 파일 저장 시 PostToolUse hook(`.claude/hooks/design-system-check.sh`)이 금지 패턴을 grep한다. 검사 대상: 순수 검정(`#000`/`black`), `1px solid` border, Tailwind `border*`·`divide-*` 유틸, `<hr>`, `border-bottom`, `rgba(0,...)` 기반 `box-shadow`. 위반 시 exit 2로 차단되며 즉시 재수정한다.

Hook은 `.claude/settings.json`에 등록되어 있어 클론 후 별도 설정 없이 동작한다.

---

## 커밋 규칙

Conventional Commits 형식을 강제한다 (commitlint + husky).

```
<type>: <제목>

<본문 — 최소 2줄>
```

- **type**: `feat` | `fix` | `chore` | `refactor` | `test` | `docs` | `style`
- 제목 필수, 본문 필수 (비어있거나 1줄이면 커밋 차단)
- pre-commit: lint-staged로 staged `.ts/.tsx` 파일에 ESLint + Prettier 자동 실행

## 테스트 환경

- **단위/통합**: Vitest + jsdom + @testing-library/react. `src/test-setup.ts`에서 jest-dom matchers 설정. API는 모킹해서 사용 (JSON Server 불필요).
- **E2E**: Playwright (chromium), `tests/*.spec.ts`. `playwright.config.ts`의 `webServer`가 `npm run dev`를 자동 기동하므로 별도 서버 실행 불필요. baseURL `http://localhost:5173`.
- E2E는 실제 JSON Server에 POST/DELETE로 테스트 데이터를 만들고 afterEach에서 정리한다.

---

## TDD 이슈 사이클 (워크플로우)

새 이슈 작업 시 아래 순서를 따른다. **각 단계 완료 후 반드시 인간 승인을 기다린다. 자동으로 다음 단계로 넘어가지 말 것.**

| 단계 | 명령                 | 설명                                                           |
| ---- | -------------------- | -------------------------------------------------------------- |
| 1    | `/test-scenarios N`  | 시그니처 확정 + 시나리오 도출 (skill)                          |
| 2    | `/tdd-red N`         | 실패 테스트 작성, Red 상태 확인 (skill)                        |
| 3    | `/tdd-green N`       | 최소 구현, 전체 테스트 통과 (skill)                            |
| 4    | `@ac-verifier N`     | AC 충족 독립 검증 — 테스트 통과 ≠ AC 충족 (agent)              |
| 5    | `/tdd-refactor N`    | 구조 개선, 깨지면 즉시 롤백 (skill)                            |
| 6    | `/security-review N` | 타입·보안 점검 (skill)                                         |
| 7    | `/create-pr`         | E2E 통과 시 push + PR 생성 (skill). squash merge → 이슈 클로즈 |

**Claude의 역할**: 현재 이슈의 진행 단계를 파악하고, 완료된 단계 확인 후 다음 단계 명령을 **제안**한다. 실행은 항상 인간이 결정한다.

**이슈 의존성**: 선행 이슈가 있으면 해당 이슈가 머지된 `feature/<spec>` 브랜치에서 분기한다.

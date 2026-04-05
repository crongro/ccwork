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
```

## 아키텍처

```
src/
├── types/note.ts          # Note 인터페이스 (id, title, content, createdAt, updatedAt)
├── api/notes.ts           # fetch 기반 CRUD 함수 (API_URL=http://localhost:3001)
├── context/NotesContext.tsx  # 전역 상태: notes[], loading, error + addNote/editNote/removeNote
├── components/
│   ├── Layout.tsx         # sidebar + main 슬롯을 받는 레이아웃
│   ├── NoteList.tsx       # 노트 목록, 선택 상태 관리
│   ├── NoteItem.tsx       # 개별 노트 항목
│   └── NoteEditor.tsx     # 노트 생성/편집 폼
└── App.tsx                # selectedNoteId, isCreating 상태 — NotesProvider 루트
```

**데이터 흐름**: `App` → `NotesProvider`(Context) → 컴포넌트. 모든 API 호출은 `context/NotesContext.tsx`에서만 수행하고, 컴포넌트는 `useNotes()` 훅을 통해 데이터에 접근한다.

**백엔드**: `db.json`이 JSON Server의 데이터 소스. `src/api/notes.ts`는 순수 fetch 함수만 포함하며, 타임스탬프(`createdAt`, `updatedAt`) 세팅도 여기서 처리한다.

## 구현 패턴

### 컴포넌트
- **named export** 사용 (`export function ComponentName`). `App.tsx`만 예외적으로 default export.
- Props 타입은 컴포넌트 바로 위에 `interface ${ComponentName}Props`로 정의하고 파라미터에서 직접 destructuring.
- 상태에 따른 early return(loading, error, empty)을 JSX 앞에 배치.

### 상태 관리 (3계층 분리)
| 계층 | 위치 | 내용 |
|------|------|------|
| 서버 상태 | `NotesContext` | `notes[]`, `loading`, `error` |
| UI 상태 | `App.tsx` | `selectedNoteId`, `isCreating` |
| 폼 로컬 상태 | `NoteEditor` | `title`, `content`, `saving` |

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

## 테스트 환경

- Vitest + jsdom + @testing-library/react
- `src/test-setup.ts`에서 jest-dom matchers 설정
- 테스트 실행 전 JSON Server가 필요 없도록 API는 모킹해서 사용

## 향후 추가 예정 (강의 진행 중)

- `Note` 타입에 `tags` 필드 추가

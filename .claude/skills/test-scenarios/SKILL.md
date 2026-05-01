---
name: test-scenarios
description: GitHub 이슈를 입력으로 받아 (1) 시그니처 확정 → (2) 테스트 시나리오 도출의 2단계 파이프라인을 수행한다. TDD의 Red 단계 직전, 코드 작성 전에 함수/Props/에러 케이스의 시그니처를 먼저 고정하고, 그 시그니처를 기준으로 정상/경계/예외 시나리오를 추출해 `docs/features/{feature}/issue-{N}.md`에 기록한다. Use when (1) 사용자가 `/test-scenarios <이슈번호>` 명령을 사용할 때, (2) 사용자가 "TDD 시작", "시그니처 확정", "테스트 시나리오 도출", "Acceptance Criteria 분해", "테스트 케이스 정리", "이슈 단위 테스트 설계" 등을 언급할 때, (3) `feature-planner`로 분해된 이슈를 실제 구현에 들어가기 직전 단계에서. 각 단계는 [GATE]로 사용자 확정을 요구하므로 끝까지 달려가지 말 것. 구현 코드는 절대 작성하지 않는다.
---

# Test Scenarios

`feature-planner`가 만든 GitHub 이슈를 **TDD 가능한 작업 단위**로 다시 한 번 정련한다.
이슈의 AC(Acceptance Criteria)를 입력으로, 다음 두 산출물을 만든다:

1. **시그니처** — 함수/훅/컴포넌트의 이름·파라미터·반환 타입·에러 케이스
2. **테스트 시나리오** — 시그니처에 대한 정상/경계/예외 케이스 목록

이 스킬은 **이름과 형태만 결정**한다. 구현 코드도, 테스트 코드도 작성하지 않는다.

## 입력

- `$ARGUMENTS` — GitHub 이슈 번호 (예: `1`, `2`)
- 슬래시 호출: `/test-scenarios 1`

## 사전 권장사항

이 스킬의 워크플로우는 **서브에이전트(컨텍스트 fork)에서 실행하는 것을 권장**한다. 이슈 본문, PRD, 코드베이스를 모두 읽기 때문에 메인 컨텍스트가 무거워질 수 있다. 메인 에이전트는 Agent 도구로 fork해 위임하고 결과(시그니처/시나리오)만 회수하는 것이 이상적이다.

## 핵심 원칙

1. **구현 코드 절대 금지.** 시그니처만 정의한다. `function foo(a: string): string { ... }`는 OK, `return a.trim()`은 NO.
2. **기존 패턴을 따른다.** `src/api/notes.ts`, `src/context/NotesContext.tsx`, 기존 컴포넌트 Props 컨벤션(`interface ${Component}Props`)을 그대로 사용한다.
3. **[GATE]에서 멈춘다.** 사용자 확정 없이 다음 단계로 넘어가지 않는다.
4. **AC 100% 커버리지.** 이슈의 모든 AC 항목이 최소 1개 이상의 시나리오로 매핑되어야 한다.

## 출력 위치

`docs/features/{feature}/issue-{N}.md`

- `{feature}`는 이슈 본문에서 식별한다. 이슈 제목/본문에 `TAG-1`, `TAG-2`처럼 prefix가 있으면 그 기능을 지칭한다 (`TAG-*` → `tag/`).
- `{feature}` 디렉터리가 모호하면 사용자에게 묻는다. 추측 금지.
- `{N}`은 GitHub 이슈 번호.

---

## 파이프라인

```
GitHub Issue (#N) + prd.md + 코드베이스
    ↓ 단계 1 — 시그니처 확정
docs/features/{feature}/issue-{N}.md (상단: 시그니처)
    ↓ 단계 2 — 시나리오 도출 + AC 대조
docs/features/{feature}/issue-{N}.md (하단: 시나리오)
    ↓
TDD 구현 단계로 인계 (다른 스킬/사람이 담당)
```

---

## 단계 1: 시그니처 확정

### 수행 순서

1. **이슈 본문 조회** — `gh issue view $ARGUMENTS --json title,body,labels` 로 이슈 내용을 읽는다.
2. **PRD 읽기** — `docs/features/{feature}/prd.md`를 읽어 기술 결정(ADR)과 Out of Scope를 파악한다.
3. **코드베이스 탐색** — 이슈가 손대는 영역의 기존 패턴을 확인한다:
   - `src/types/*.ts` — 타입 정의 컨벤션
   - `src/api/notes.ts` — API 함수 시그니처 패턴 (`fetchX`, `createX`, `updateX`, `deleteX`)
   - `src/context/NotesContext.tsx` — Context 함수 노출 패턴
   - 관련 컴포넌트의 `interface ${Component}Props`
   - 훅이 있다면 `src/hooks/*.ts`의 반환 타입 컨벤션
4. **시그니처 도출** — 다음 4가지를 빠짐없이 채운다:

   **(a) 타입 정의** (필요 시)

   ```ts
   // 예시 — 실제 코드는 작성 금지, 시그니처만
   interface Note {
     id: string;
     // ... 기존 필드
     tags: string[]; // 추가되는 필드
   }
   ```

   **(b) 함수/훅 시그니처**

   ```ts
   function useTagInput(
     initialTags: string[],
     options?: { maxTags?: number; maxLen?: number },
   ): {
     tags: readonly string[];
     input: string;
     isFull: boolean;
     setInput: (value: string) => void;
     commit: () => void;
     handleKeyDown: (e: React.KeyboardEvent) => void;
   };
   ```

   **(c) 에러 케이스** — "어떤 입력에서 어떤 에러를 던지는가" 또는 "어떤 입력을 무시(no-op)하는가"
   - 예: `commit()`은 `input.trim() === ''`일 때 no-op
   - 예: `updateNote(id, updates)`는 `!res.ok`일 때 `Error('노트 갱신 실패')` throw
   - 던지지 않는 경우(silent ignore)도 명시한다.

   **(d) 컴포넌트 Props**

   ```ts
   interface TagChipInputProps {
     tags: readonly string[];
     input: string;
     isFull: boolean;
     onInputChange: (value: string) => void;
     onCommit: () => void;
     onRemove: (tag: string) => void;
     onKeyDown: (e: React.KeyboardEvent) => void;
   }
   ```

5. **시그니처를 사용자에게 제시** — 4가지를 한 번에 보여주고, 각 결정의 근거를 한 줄씩 덧붙인다.

### [GATE] 단계 1 완료 조건

사용자가 시그니처를 읽고 **"확정한다"** 또는 동등한 명시적 승인을 줄 때까지 다음 단계로 진행하지 않는다.

수정 요청이 들어오면 반영 후 다시 제시한다. 무한 루프를 우려하지 말고, 사용자가 명시적으로 OK 할 때까지 반복한다.

### 1-(끝). 산출물 기록

승인된 시그니처를 `docs/features/{feature}/issue-{N}.md` **상단**에 기록한다. 형식:

````markdown
# Issue #{N} — {이슈 제목}

> 출처: GitHub Issue #{N}
> 관련 PRD: docs/features/{feature}/prd.md

## 시그니처

### 타입

```ts
// ...
```
````

### 함수/훅

```ts
// ...
```

### 에러 케이스

- ...

### 컴포넌트 Props

```ts
// ...
```

---

```

(이후 단계 2의 시나리오가 같은 파일 하단에 추가된다.)

---

## 단계 2: 테스트 시나리오 도출

### 수행 순서

1. **시그니처 기반 시나리오 도출** — 시그니처에 적힌 각 함수/Props/에러 케이스마다 다음 3분류로 시나리오를 만든다:

   - **정상**: 행복 경로. 일반적인 입력에 대한 기대 동작.
   - **경계**: 한계값/엣지. 빈 배열, 최대값, 0, 1, 마지막 요소 삭제 등.
   - **예외**: 잘못된 입력, 네트워크 실패, 무시되어야 할 입력.

2. **시나리오 형식** — 한 줄로 표현한다:
```

[정상] commit — should add trimmed tag to tags when input is non-empty
[경계] commit — should be no-op when tags.length === maxTags
[예외] commit — should not add tag when input.trim() === ''

````

- 분류는 `[정상]`/`[경계]`/`[예외]` 중 하나.
- `함수명` 또는 `컴포넌트명.동작` 단위로 명명.
- `should [기대동작] when [조건]` 영문 BDD 컨벤션 권장 (한국어 혼용 가능, 단 형식은 통일).

3. **AC 대조** — 이슈 본문의 AC 목록과 시나리오를 매핑한다:
- `gh issue view $ARGUMENTS` 로 AC를 다시 읽는다.
- 각 AC가 최소 1개 이상의 시나리오로 커버되는지 확인한다.
- **누락된 AC가 있으면 시나리오를 추가**한다. 추측으로 채우지 말고, AC 문장 그대로의 행동을 시나리오화한다.
- 매핑 표를 만들어 검증을 가시화한다:

  ```markdown
  ## AC 커버리지

  | AC    | 커버하는 시나리오                                                    |
  | ----- | -------------------------------------------------------------------- |
  | AC-1  | [정상] Note 타입 — should default tags to [] when field is missing   |
  | AC-2  | [정상] useTagInput — should expose tags/input/setInput/commit/...    |
  | ...   | ...                                                                  |
  ```

4. **시나리오를 사용자에게 제시** — 분류별로 묶어 보여준다. AC 커버리지 표도 함께.

### [GATE] 단계 2 완료 조건

사용자가 시나리오 목록을 읽고 다음을 확인할 때까지 대기:

- 정상/경계/예외 분류가 적절한가
- 모든 AC가 커버되는가 (커버리지 표 검증)
- 누락된 케이스가 없는가 (사용자가 도메인 지식으로 추가 제안 가능)

사용자가 명시적으로 **"확정한다"** 라고 말할 때까지 다음 단계로 진행하지 않는다.

### 2-(끝). 산출물 기록

승인된 시나리오를 `docs/features/{feature}/issue-{N}.md` **하단**에 추가한다. 단계 1의 시그니처 섹션은 그대로 두고, `## 테스트 시나리오` 섹션을 이어 붙인다:

```markdown
## 테스트 시나리오

### 정상
- [정상] ...
- [정상] ...

### 경계
- [경계] ...

### 예외
- [예외] ...

## AC 커버리지

| AC    | 커버하는 시나리오 |
| ----- | ----------------- |
| AC-1  | ...               |
````

---

## 산출물 최종 형태

`docs/features/{feature}/issue-{N}.md` 한 파일이다. 구조:

```
# Issue #{N} — {제목}
## 시그니처
  ### 타입
  ### 함수/훅
  ### 에러 케이스
  ### 컴포넌트 Props
## 테스트 시나리오
  ### 정상
  ### 경계
  ### 예외
## AC 커버리지
```

이 파일이 다음 단계(TDD 구현)의 입력이 된다.

---

## 승인 게이트 요약

| 지점      | 확인 내용                                               |
| --------- | ------------------------------------------------------- |
| 단계 1 후 | 시그니처 — 함수/타입/에러/Props 4요소가 모두 채워졌는가 |
| 단계 2 후 | 시나리오 — 정상/경계/예외 분류, AC 100% 커버            |

## 자주 하는 실수 (피할 것)

- **구현 코드를 슬쩍 적기**: 함수 본문에 `return ...`이 들어가면 안 된다. 시그니처만이다.
- **AC 누락**: AC 6개 중 5개만 시나리오로 커버하고 넘어가는 일이 흔하다. 매핑 표를 반드시 채운다.
- **분류 모호**: "[정상] / [경계] / [예외]" 외의 임의 분류 만들지 말 것. 셋 중 어디에 속하는지 애매하면 사용자에게 묻는다.
- **기존 패턴 무시**: `addTag` 같은 신조어 함수명을 쓰지 말 것. `src/api/notes.ts`의 `createNote`, `updateNote`처럼 기존 동사 컨벤션을 재사용한다.
- **추측으로 시나리오 추가**: AC에 없는 케이스를 임의로 추가해 범위 확장. PRD의 Out of Scope를 다시 확인한다.
- **게이트 건너뛰기**: 사용자가 "좋아요"라고만 말해도 두 번째 게이트까지 한 번에 진행 금지. 단계마다 확정을 받는다.
- **`gh` 호출 누락**: AC 대조 단계에서 메모리에 의존하지 말고 반드시 `gh issue view $ARGUMENTS`로 최신 본문을 다시 읽는다. 이슈는 편집될 수 있다.

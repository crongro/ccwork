---
name: tdd-auto-loop
description: GitHub 이슈 번호를 받아 TDD 풀 사이클(사전점검 → test-scenarios → tdd-red → tdd-green → ac-verifier → tdd-refactor → security-review → create-pr)을 사용자 개입 없이 자동 완주하는 오케스트레이터 스킬. 각 단계는 Agent 서브에이전트로 격리 실행되며, 단계별 JSON 결과를 기반으로 진행/STOP을 결정한다. Use when (1) 사용자가 `/tdd-auto-loop <이슈번호>` 명령을 사용할 때, (2) "자동주행", "자동 TDD", "무인 TDD", "끝까지 자동으로" 등을 언급할 때.
---

# TDD Auto Loop

GitHub 이슈 번호를 입력으로 받아 TDD 풀 사이클을 **사용자 개입 없이** 자동 완주한다.

## 입력

- `$ARGUMENTS` — GitHub 이슈 번호 (예: `19`)
- 슬래시 호출: `/tdd-auto-loop 19`

## 오케스트레이션 원칙

- **메인(이 스킬 실행 주체)은 코드 본문을 직접 읽지 않는다.** 모든 코드 조작은 서브에이전트에서만.
- **각 단계는 `Agent` 도구로 서브에이전트를 spawn해서 격리 실행.**
- **서브에이전트는 지정 JSON 스키마 코드블록 하나만 반환.** 나머지 텍스트는 무시.
- AC 검증 에이전트는 Green 에이전트와 **반드시 별도 Agent 호출**로 분리.
- 진행 메시지: `[단계명] OK` 또는 `STOP({사유})` 한 줄만 출력.

---

## 자율 모드 접미어

모든 서브에이전트 프롬프트 끝에 아래 블록을 그대로 붙인다.

```
---
[AUTO-MODE]
- 사용자 승인 게이트가 있으면 자체 통과한다 (묻지 않는다)
- 모호하거나 판단 불가 상황이면 추측 없이 즉시 status="stop"으로 반환한다
- 응답은 지정 JSON 스키마 코드 블록 하나만 출력한다. 그 외 텍스트 절대 금지
```

---

## 단계별 JSON 스키마

서브에이전트가 반환해야 하는 스키마. **필드 추가·삭제·타입 변경 금지.**

### Stage 0 — pre-check

```json
{
  "stage": 0,
  "name": "pre-check",
  "status": "ok",
  "issue_number": 19,
  "ac_count": 3,
  "base_branch": "feature/tag-filter",
  "working_branch": "feat/tag-badge-19",
  "stop_reason": null
}
```

### Stage 1 — test-scenarios

```json
{
  "stage": 1,
  "name": "test-scenarios",
  "status": "ok",
  "scenario_count": 5,
  "issue_doc": "docs/features/tag-filter/issue-19.md",
  "stop_reason": null
}
```

### Stage 2 — tdd-red

```json
{
  "stage": 2,
  "name": "tdd-red",
  "status": "ok",
  "test_files": ["src/components/NoteItem.test.tsx"],
  "failed_count": 5,
  "stop_reason": null
}
```

### Stage 3 — tdd-green

```json
{
  "stage": 3,
  "name": "tdd-green",
  "status": "ok",
  "attempt": 1,
  "scenarios_passed": 5,
  "scenarios_total": 5,
  "changed_files": ["src/components/NoteItem.tsx"],
  "stop_reason": null
}
```

### Stage 4 — ac-verifier

```json
{
  "stage": 4,
  "name": "ac-verifier",
  "status": "ok",
  "ac_passed": true,
  "gaps": [],
  "stop_reason": null
}
```

### Stage 5 — tdd-refactor

```json
{
  "stage": 5,
  "name": "tdd-refactor",
  "status": "ok",
  "changed_files": [],
  "tests_green": true,
  "stop_reason": null
}
```

### Stage 6 — security-review

```json
{
  "stage": 6,
  "name": "security-review",
  "status": "ok",
  "high_count": 0,
  "medium_count": 0,
  "issues": [],
  "stop_reason": null
}
```

### Stage 7 — create-pr

```json
{
  "stage": 7,
  "name": "create-pr",
  "status": "ok",
  "pr_url": "https://github.com/crongro/claudetdd-ccwork/pull/21",
  "base_branch": "feature/tag-filter",
  "stop_reason": null
}
```

---

## 단계 0 — 사전 점검 (메인이 직접 실행)

서브에이전트 없이 메인이 bash로 직접 수행한다.

```bash
gh issue view $ARGUMENTS           # AC 섹션 존재 여부 확인
git status --porcelain             # 비어 있어야 함
git branch --show-current          # feature/* 또는 feat/* 여야 함
```

**STOP 조건**:

| 조건                                              | STOP 사유             |
| ------------------------------------------------- | --------------------- |
| `## Acceptance Criteria` 섹션이 없음              | `AC 없음`             |
| `git status --porcelain` 출력이 비어있지 않음     | `uncommitted changes` |
| 브랜치가 `feature/` 또는 `feat/` 로 시작하지 않음 | `잘못된 base 브랜치`  |

**브랜치 생성**:

- 이슈 제목을 kebab-case로 변환해 `feat/<slug>-<N>` 브랜치 생성·체크아웃
- 해당 브랜치가 이미 존재하면 체크아웃 후 계속 (재실행으로 간주, STOP 없음)

단계 0 JSON을 세션에 출력하고 `[pre-check] OK` 한 줄 출력.

---

## 단계 1 — test-scenarios (서브에이전트)

**Agent 프롬프트**:

````
GitHub 이슈 {N}에 대해 test-scenarios 스킬을 실행한다.
Skill tool로 `/test-scenarios {N}`을 호출하라.
스킬 완료 후 아래 JSON 스키마를 채워 반환하라.

```json
{
  "stage": 1,
  "name": "test-scenarios",
  "status": "ok | stop",
  "scenario_count": 0,
  "issue_doc": "",
  "stop_reason": null
}
````

[AUTO-MODE 접미어 첨부]

```

**재시도**: status="stop" 또는 JSON 파싱 실패 → 1회 재시도. 재시도도 실패 → `STOP(test-scenarios 실패)`.

---

## 단계 2 — tdd-red (서브에이전트)

**Agent 프롬프트**:

```

GitHub 이슈 {N}에 대해 tdd-red 스킬을 실행한다.
Skill tool로 `/tdd-red {N}`을 호출하라.
스킬 완료 후 아래 JSON 스키마를 채워 반환하라.

```json
{
  "stage": 2,
  "name": "tdd-red",
  "status": "ok | stop",
  "test_files": [],
  "failed_count": 0,
  "stop_reason": null
}
```

[AUTO-MODE 접미어 첨부]

```

**재시도**: status="stop" → 1회 재시도. 실패 → `STOP(tdd-red 실패)`.

---

## 단계 3 — tdd-green (서브에이전트, 최대 3회)

**Agent 프롬프트** (`{attempt}` = 현재 시도 횟수, 1부터 시작):

```

GitHub 이슈 {N}에 대해 tdd-green 스킬을 실행한다. 이번이 {attempt}번째 시도다.
Skill tool로 `/tdd-green {N}`을 호출하라.
스킬 완료 후 아래 JSON 스키마를 채워 반환하라. attempt 필드에 {attempt}를 넣어라.

```json
{
  "stage": 3,
  "name": "tdd-green",
  "status": "ok | stop",
  "attempt": 1,
  "scenarios_passed": 0,
  "scenarios_total": 0,
  "changed_files": [],
  "stop_reason": null
}
```

[AUTO-MODE 접미어 첨부]

```

**재시도 정책**:
1. `status="ok"` → 단계 4로 진행
2. `status="stop"` → attempt+1로 새 Agent spawn (최대 3회)
3. 3회 모두 `status="stop"` → `STOP(tdd-green 3회 실패: {마지막 stop_reason})`

---

## 단계 4 — ac-verifier (Green과 별도 Agent 호출)

**반드시 단계 3의 Green 에이전트와 분리된 Agent 호출이어야 한다.**

**Agent 프롬프트**:

```

GitHub 이슈 {N}의 Acceptance Criteria가 현재 구현에서 충족되는지 독립 검증한다.
이 에이전트는 Green 단계와 완전히 격리된 별도 실행이다.

1. `gh issue view {N}` 으로 AC 목록을 가져온다
2. 현재 코드베이스를 읽어 각 AC 항목의 충족 여부를 판단한다
3. 아래 JSON 스키마를 채워 반환하라
   - ac_passed: 모든 AC가 충족되면 true
   - gaps: 미충족 AC 항목 설명 배열 (충족이면 빈 배열)

```json
{
  "stage": 4,
  "name": "ac-verifier",
  "status": "ok | stop",
  "ac_passed": true,
  "gaps": [],
  "stop_reason": null
}
```

[AUTO-MODE 접미어 첨부]

````

**STOP 조건**: `ac_passed: false` → gh issue comment 후 `STOP(AC 미충족)`.

```bash
gh issue comment {N} --body "🛑 [tdd-auto-loop] AC 미충족으로 중단

미충족 항목:
{gaps 줄바꿈 목록}

사람이 개입해서 재시작하세요."
````

---

## 단계 5 — tdd-refactor (서브에이전트)

**Agent 프롬프트**:

````
GitHub 이슈 {N}에 대해 tdd-refactor 스킬을 실행한다.
Skill tool로 `/tdd-refactor {N}`을 호출하라.
스킬 완료 후 아래 JSON 스키마를 채워 반환하라.

```json
{
  "stage": 5,
  "name": "tdd-refactor",
  "status": "ok | stop",
  "changed_files": [],
  "tests_green": true,
  "stop_reason": null
}
````

[AUTO-MODE 접미어 첨부]

```

**재시도**: status="stop" → 1회 재시도. 실패 → `STOP(tdd-refactor 실패)`.

---

## 단계 6 — security-review (서브에이전트)

**Agent 프롬프트**:

```

GitHub 이슈 {N}에 대해 security-review 스킬을 실행한다.
Skill tool로 `/security-review {N}`을 호출하라.
스킬 완료 후 아래 JSON 스키마를 채워 반환하라.

```json
{
  "stage": 6,
  "name": "security-review",
  "status": "ok | stop",
  "high_count": 0,
  "medium_count": 0,
  "issues": [],
  "stop_reason": null
}
```

[AUTO-MODE 접미어 첨부]

````

**STOP 조건**: `high_count > 0` → gh issue comment 후 `STOP(Security High: {issues})`.

```bash
gh issue comment {N} --body "🛑 [tdd-auto-loop] Security High 이슈로 중단

발견된 이슈:
{issues 줄바꿈 목록}

사람이 개입해서 재시작하세요."
````

---

## 단계 7 — create-pr (서브에이전트)

**Agent 프롬프트**:

````
GitHub 이슈 {N}에 대해 create-pr 스킬을 실행한다.
Skill tool로 `/create-pr {N}`을 호출하라.

추가 요구사항 (스킬 내부에 전달):
- base 브랜치: {base_branch} (단계 0에서 확인한 feature/<spec>)
- PR body에 반드시 "Closes #{N}" 포함
- commitlint 검증 통과 필수 (--no-verify 금지)

스킬 완료 후 아래 JSON 스키마를 채워 반환하라.

```json
{
  "stage": 7,
  "name": "create-pr",
  "status": "ok | stop",
  "pr_url": "",
  "base_branch": "",
  "stop_reason": null
}
````

[AUTO-MODE 접미어 첨부]

````

**STOP 조건**: status="stop" (commitlint 실패 포함) → `STOP(create-pr 실패: {stop_reason})`.

---

## STOP 공통 처리

STOP이 발생하면 다음 순서로 처리한다.

1. `STOP({사유})` 한 줄 출력
2. gh issue에 중단 사유 코멘트:

```bash
gh issue comment {N} --body "🛑 [tdd-auto-loop] 단계 {X}에서 중단

사유: {사유}

사람이 개입해서 재시작하세요."
````

3. 루프 종료. **사람에게 추가로 묻지 않는다.**

---

## 전체 진행 출력 예시

정상 완주:

```
[pre-check] OK
[test-scenarios] OK
[tdd-red] OK
[tdd-green] OK (attempt 1)
[ac-verifier] OK
[tdd-refactor] OK
[security-review] OK
[create-pr] OK → https://github.com/crongro/claudetdd-ccwork/pull/21
```

STOP 발생:

```
[tdd-green] STOP(3회 실패: 시나리오 #3 assertion mismatch)
```

---

## 재시도 정책 요약

| 단계            | 최대 재시도 | STOP 조건              |
| --------------- | ----------- | ---------------------- |
| test-scenarios  | 1회         | status="stop" 2회 연속 |
| tdd-red         | 1회         | status="stop" 2회 연속 |
| tdd-green       | **3회**     | status="stop" 3회 연속 |
| ac-verifier     | 0회         | ac_passed=false        |
| tdd-refactor    | 1회         | status="stop" 2회 연속 |
| security-review | 0회         | high_count > 0         |
| create-pr       | 0회         | status="stop"          |

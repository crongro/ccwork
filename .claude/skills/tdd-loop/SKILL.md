---
name: tdd-loop
description: GitHub 이슈 번호 1개를 받아 TDD 풀 사이클 7단계(사전점검 → test-scenarios → tdd-red → tdd-green → ac-verifier → tdd-refactor → security-review → create-pr)를 순서대로 실행하는 컨테이너 스킬. 각 단계 내부의 사용자 승인 게이트는 그대로 작동한다. Use when (1) 사용자가 `/tdd-loop <이슈번호>` 명령을 사용할 때, (2) "TDD 풀 사이클", "이슈 전체 진행", "처음부터 끝까지" 등을 언급할 때.
---

# TDD Loop

이슈 번호를 받아 TDD 풀 사이클을 순서대로 실행한다. 컨테이너 역할만 하며, 각 단계 스킬/에이전트의 내부 동작과 승인 게이트는 그대로 유지된다.

## 입력

- `$ARGUMENTS` — GitHub 이슈 번호 (예: `18`)
- 슬래시 호출: `/tdd-loop 18`

## 단계 0 — 사전 점검

아래를 순서대로 실행한다. 하나라도 실패하면 사용자에게 이유를 알리고 **즉시 중단**한다.

```bash
gh issue view $ARGUMENTS          # 이슈 본문 + AC 확인
git status                        # uncommitted changes 있으면 중단
git branch --show-current         # feature/<spec> 브랜치인지 확인
```

**브랜치 처리**:

- `feat/<issue-slug>` 브랜치가 이미 존재 → 동일 이슈 재실행으로 간주, 사용자에게 "덮어쓸지/취소할지" 확인
- 존재하지 않으면 현재 `feature/<spec>` 브랜치에서 분기 후 체크아웃

`<issue-slug>`는 이슈 제목을 kebab-case로 변환한 값이다 (예: 이슈 제목 "태그 필터" → `feat/tag-filter-18`).

## 단계 1 — test-scenarios

```
/test-scenarios $ARGUMENTS
```

- 시그니처 확정 승인 게이트 (스킬 내부)
- 시나리오 승인 게이트 (스킬 내부)

## 단계 2 — tdd-red

```
/tdd-red $ARGUMENTS
```

- 시나리오 → 실패 테스트 변환
- collect 실패 시 stub 생성 안내 (스킬 내부)

## 단계 3 — tdd-green

```
/tdd-green $ARGUMENTS
```

- 최소 구현, 회귀 감시
- 최대 5회 피드백 루프 (스킬 내부)

## 단계 4 — ac-verifier

```
@ac-verifier $ARGUMENTS
```

- AC 충족 독립 검증 (에이전트)
- 갭 발견 시 사용자에게 보고 후 중단 (사용자가 재진행 결정)

## 단계 5 — tdd-refactor

```
/tdd-refactor $ARGUMENTS
```

- 구조 개선, 변경마다 `npm test` 실행
- 테스트 깨지면 즉시 롤백 (스킬 내부)

## 단계 6 — security-review

```
/security-review $ARGUMENTS
```

- `tsc`, `npm audit`, 보안 패턴 점검
- 등급별 처리 안내 (스킬 내부)

## 단계 7 — create-pr

```
/create-pr $ARGUMENTS
```

- 커밋 메시지 commitlint 통과 확인
- PR base = `feature/<spec>`
- PR body에 `Closes #$ARGUMENTS` 포함
- 이슈에 PR 링크 코멘트

## 실행 원칙

- 단계 사이에는 진행 메시지만 출력한다 (`## 단계 N 완료 → 단계 N+1 시작`).
- 각 스킬 내부의 사용자 승인 게이트는 그대로 작동한다 — 컨테이너가 추가 게이트를 만들지 않는다.
- 단계 실패 시 `[tdd-loop] 단계 N에서 중단: <이유>` 를 출력하고 즉시 멈춘다.

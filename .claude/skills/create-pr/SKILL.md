---
name: create-pr
description: |
  PR(Pull Request) 생성을 자동화한다. E2E 테스트를 통과한 경우에만 PR을 올린다.
  다음 자연어 트리거로 자동 발동:
  - "PR 만들어줘", "PR 올려줘", "PR 보내줘"
  - "이거 머지하자", "create-pr"
  명시적 호출: /create-pr
---

# create-pr

PR 생성 자동화 스킬. 초안 확인 → E2E 검증 → push + PR 생성 순서로 동작한다.

## 워크플로우

### Step 1: 변경사항 수집

```bash
git log --oneline main..HEAD        # 또는 --oneline <base>..HEAD
git diff main..HEAD --stat
```

- 현재 브랜치가 다른 `feature/*` 브랜치에서 분기했다면 그 브랜치를 base로 사용
- 그 외는 `main`을 base로 사용

### Step 2: PR 초안 생성 후 승인 요청

수집한 변경사항을 바탕으로 PR 초안을 작성해 사용자에게 보여준다.

**제목 규칙**

- Conventional Commits 형식: `<type>: <제목>` (70자 이내)
- type: `feat` | `fix` | `chore` | `refactor` | `test` | `docs` | `style`

**본문 템플릿**

```markdown
## Summary

- <변경 핵심 1>
- <변경 핵심 2>

## Changes

- <구체적 파일/로직 변경 내용>

## Test plan

- [ ] `npm test` 단위 테스트 통과
- [ ] `npm run test:e2e` E2E 통과
```

초안을 보여준 후 반드시 다음을 물어본다:

> "이 초안으로 PR을 진행할까요? 수정하실 부분이 있으면 알려주세요."

사용자가 수정을 요청하면 반영 후 재확인한다. **승인 없이 다음 단계로 넘어가지 않는다.**

### Step 3: E2E 테스트 실행

```bash
npm run test:e2e
```

### Step 4-A: E2E 실패 시 — PR 생성 중단

PR 생성을 **즉시 중단**하고 다음 안내를 출력한다:

```
❌ E2E 테스트 실패 — PR 생성을 중단합니다.

다음 순서로 근본 원인을 수정하세요:
① Trace Viewer로 실패 지점 확인
   npx playwright show-report

② 어느 레이어에서 깨졌는지 판별
   - API 레이어: fetch / 응답 형식 오류
   - 렌더링: 컴포넌트가 DOM을 잘못 표시
   - 로직: 상태 전이 / 사이드이펙트 오류

③ 해당 레이어의 단위 테스트에 실패 케이스 추가 (Red)

④ 프로덕션 코드 수정으로 단위 테스트 통과 (Green)

⑤ 다시 /create-pr 실행

⚠️ E2E 테스트 코드를 수정해서 통과시키는 것은 금지입니다.
   E2E는 사용자 시나리오의 진실 기준입니다.
```

### Step 4-B: E2E 통과 시 — push & PR 생성

```bash
# 1. push
git push -u origin HEAD

# 2. base 브랜치 결정
# - 현재 브랜치가 feature/* 에서 분기했으면: --base <parent-feature>
# - 그 외: --base main

# 3. PR 생성
gh pr create \
  --title "<승인된 제목>" \
  --base <base-branch> \
  --body "$(cat <<'EOF'
<승인된 본문>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

PR URL을 출력한다.

## 주의사항

- `--no-verify` 사용 금지 (husky + commitlint 우회 불가)
- E2E 코드 수정으로 실패를 통과시키는 것 금지
- 사용자 승인 없이 push 또는 PR 생성 금지
- base 브랜치는 반드시 git log로 확인 후 결정

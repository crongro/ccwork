#!/usr/bin/env bash
# PostToolUse hook: Edit/Write 대상 파일을 디자인 시스템 금지 패턴으로 검사한다.
# 입력: stdin으로 받는 Claude Code hook JSON. tool_input.file_path를 검사 대상으로 사용.
# 출력: 위반 시 stderr에 메시지 + exit 2 (Claude에게 피드백).

set -u

# jq 없으면 조용히 통과 (개발 환경 의존성 최소화)
if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# 대상 파일이 없거나, 스타일 작업 대상이 아니면 통과
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  exit 0
fi

case "$FILE" in
  *.tsx|*.ts|*.jsx|*.js|*.css|*.scss) ;;
  *) exit 0 ;;
esac

# design-system 문서 자체는 검사에서 제외 (금지 패턴을 설명하기 위해 포함되므로)
case "$FILE" in
  */docs/design-system/*) exit 0 ;;
esac

VIOLATIONS=""

check() {
  local pattern="$1"
  local message="$2"
  local matches
  matches=$(grep -nE "$pattern" "$FILE" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    VIOLATIONS="${VIOLATIONS}
[$message]
$matches
"
  fi
}

# 1. 순수 검정 텍스트
check '#000000|#000([^0-9a-fA-F]|$)|\bblack\b' \
  '순수 검정 금지 (Use on_surface #2b3437)'

# 2. 1px solid border (섹션/영역 분리 금지)
check '1px\s+solid' \
  'No-Line 위반: 1px solid border 사용 금지 (배경 톤 시프트 사용)'

# 2b. Tailwind border 유틸 (border, border-t 등 솔리드 보더)
check '\bclassName=[^>]*\bborder(-[tblr])?\b(\s|"|'"'"'|-[0-9])' \
  'Tailwind border 유틸 금지 (배경 톤 시프트 사용)'

# 3. Tailwind divide 유틸
check 'divide-(y|x)-' \
  'Divider 금지: Tailwind divide-y/divide-x 대신 spacing.4 간격 사용'

# 4. 기본 box-shadow
check 'box-shadow:\s*[^;]*rgba?\(0' \
  '기본 box-shadow 금지 (Tonal Layering 사용)'

# 5. HR 태그
check '<hr[[:space:]/>]' \
  '<hr> divider 금지'

# 6. border-bottom을 리스트 구분용으로
check 'border-bottom:\s*[^;]' \
  'border-bottom 금지: 리스트 구분은 spacing.4 간격으로'

if [ -n "$VIOLATIONS" ]; then
  {
    echo "⚠️  Design System 위반 감지: $FILE"
    echo "$VIOLATIONS"
    echo ""
    echo "규칙 확인: docs/design-system/dont.md"
    echo "수정 후 다시 저장하세요."
  } >&2
  exit 2
fi

exit 0

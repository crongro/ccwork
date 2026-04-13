# 🚫 Don't — 절대 하지 말 것

> Hook이 이 파일의 금지 패턴을 자동 검사한다. 위반 시 재수정해야 한다.

## 색상

- 🚫 **순수 검정 `#000000` / `black` 텍스트 금지** — 반드시 `on_surface` (#2b3437).
- 🚫 **정의되지 않은 HEX 값** 사용 금지 — `docs/design-system/01-tokens-color.md`의 토큰만.
- 🚫 **Accent 컬러(`tertiary`)를 장식 목적으로 남용 금지** — 의도된 액션에만.

## 보더 & 구분선

- 🚫 **1px solid border로 섹션 분리 금지** — 배경 톤 시프트로 대체.
- 🚫 **사이드바와 본문을 보더로 분리 금지** — `surface_container_low` → `surface`로.
- 🚫 **리스트/카드 항목 사이에 divider 라인 금지** (`<hr>`, `border-bottom`, `divide-y` 전부).
- 🚫 **카드/Chip/버튼에 `border: 1px solid ...` 추가 금지**.
- 🚫 **입력 필드 평상시 선명한 보더 금지** — Ghost Border만. Focus 때만 선명.

## 그림자

- 🚫 **기본 `box-shadow` 남용 금지** — Tonal Layering 우선.
- 🚫 **비-플로팅 요소에 그림자 적용 금지**.

## 타이포그래피

- 🚫 **Inter 외 다른 폰트 사용 금지**.
- 🚫 **`#000000` 텍스트 금지** (중복 강조).

## 아이콘 & 장식

- 🚫 **장식용 아이콘 금지** — 기능적 명확성이 없다면 넣지 않는다.

## Spacing

- 🚫 **정의되지 않은 px/rem 값 금지** — `docs/design-system/03-tokens-spacing.md` 토큰만.

---

## Hook 자동 검출 패턴

다음 패턴은 PostToolUse hook이 `.tsx`/`.css`/`.ts` 파일에서 자동으로 grep하여 경고한다:

| 패턴                               | 이유                                        |
| ---------------------------------- | ------------------------------------------- |
| `#000000`, `#000\b`, `:\s*black\b` | 순수 검정 금지                              |
| `border:\s*1px\s+solid`            | No-Line 규칙 위반 가능성                    |
| `border-bottom:\s*1px`             | List divider 금지                           |
| `divide-y`, `divide-x`             | Tailwind divider 유틸 금지                  |
| `box-shadow:\s*0`                  | 기본 박스 섀도우 금지 (Tonal Layering 사용) |
| `<hr\b`                            | HR 태그 divider 금지                        |

---
name: design-system
description: Use when editing UI components, CSS, Tailwind classes, styling any .tsx/.css file, building new components, or any visual/layout work in this Note app. Provides "The Digital Atelier" design tokens, component specs, and Do/Don't rules. Trigger on keywords like style, UI, design, layout, component, CSS, Tailwind, color, spacing, hover, focus, theme.
---

# Design System Skill — The Digital Atelier

이 skill은 Note 앱의 모든 스타일 작업에서 참조된다. 디자인 시스템은 `docs/design-system/` 아래에 파일로 분할되어 있다.

## 작업 원칙 (암기)

### 핵심 3원칙

1. **No-Line**: 섹션 구분에 `border: 1px solid` 금지 → 배경 톤 시프트로 대체
2. **Tonal Layering**: `box-shadow` 대신 surface 계층(#ffffff on #eaeff1)으로 깊이 표현
3. **Editorial Authority**: Inter 단일 폰트, 장식 아이콘 금지

### 절대 금지 (Hook이 자동 검사)

- `#000000` / `black` 텍스트 사용 금지 → `#2b3437` (`on_surface`)
- `border: 1px solid` 로 영역 분리 금지
- `border-bottom` / `<hr>` / `divide-y` 로 리스트 구분 금지
- 기본 `box-shadow` 로 카드 띄우기 금지 → Tonal Layering

## 작업 순서 (필수)

스타일 관련 요청을 받으면 **반드시** 아래 순서로 진행한다:

### 1. 금지 패턴 확인

먼저 **`docs/design-system/dont.md`**를 Read 한다. 위반 시 hook이 차단한다.

### 2. 작업 대상에 맞는 파일 로드

| 작업        | 로드할 파일                                     |
| ----------- | ----------------------------------------------- |
| 색상 결정   | `docs/design-system/01-tokens-color.md`         |
| 폰트/텍스트 | `docs/design-system/02-tokens-typography.md`    |
| 여백/간격   | `docs/design-system/03-tokens-spacing.md`       |
| 그림자/깊이 | `docs/design-system/04-elevation.md`            |
| 버튼        | `docs/design-system/05-components/button.md`    |
| 카드/리스트 | `docs/design-system/05-components/card-list.md` |
| 입력 필드   | `docs/design-system/05-components/input.md`     |
| 태그/Chip   | `docs/design-system/05-components/chip.md`      |

필요한 파일만 선택적으로 Read한다. 전부 읽을 필요 없다.

### 3. 구현

토큰/규칙에 맞춰 코드 작성. 임의의 HEX나 px 값 사용 금지.

### 4. 자가 검증

`docs/design-system/do.md` 체크리스트로 스스로 리뷰 후 작업 마무리.

### 5. Hook 피드백 대응

파일 저장 시 PostToolUse hook (`.claude/hooks/design-system-check.sh`)이 금지 패턴을 grep한다. 위반이 검출되면 즉시 재수정한다.

## 자주 쓰는 토큰 (빠른 참조)

```
surface                    #f8f9fa  (기본 배경)
surface_container_low      #f1f4f6  (사이드바, hover)
surface_container          #eaeff1  (섹션 배경)
surface_container_high     #e2e9ec  (secondary 버튼)
surface_container_highest  #dbe4e7  (selected, chip)
surface_container_lowest   #ffffff  (카드, 입력)
on_surface                 #2b3437  (본문 강조)
on_surface_variant         #586064  (롱폼, 메타)
outline_variant            #abb3b7  (ghost border, 15% opacity)
tertiary                   #0053dc  (accent, CTA, focus)
tertiary_container         #3e76fe  (CTA 그라디언트 종점)
on_tertiary                #faf8ff  (primary 버튼 텍스트)

spacing.1  0.35rem
spacing.2  0.7rem
spacing.4  1.4rem  (기본 리듬, 리스트 간격)
spacing.10 3.5rem  (섹션 갭)
```

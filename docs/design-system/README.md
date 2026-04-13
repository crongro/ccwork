# Note App Design System — The Digital Atelier

> Note 앱의 모든 스타일/UI 작업은 이 디자인 시스템을 참조한다.
> Claude Code 환경에서는 `design-system` skill이 자동 호출되어 관련 파일을 로드한다.

## 철학

개인 박물관의 소장품처럼 모든 TIL 항목을 다룬다. Soft Minimalism, Tonal Depth, Editorial Authority.
자세한 내용 → [`00-principles.md`](./00-principles.md)

## 파일 구조

```
docs/design-system/
├── 00-principles.md         # Creative North Star, No-Line, Tonal Depth
├── 01-tokens-color.md       # Surface, 텍스트, accent 컬러 토큰
├── 02-tokens-typography.md  # Inter 스케일, 톤 규칙
├── 03-tokens-spacing.md     # 1.4rem 리듬
├── 04-elevation.md          # Tonal Layering, Shadow, Ghost Border
├── 05-components/
│   ├── button.md
│   ├── card-list.md
│   ├── input.md
│   └── chip.md
├── do.md                    # ✅ 반드시 따를 규칙
└── dont.md                  # 🚫 절대 금지 패턴 (hook 검사 대상)
```

## 작업 순서

1. **[`dont.md`](./dont.md)** 먼저 읽기 — 금지 패턴 파악
2. 작업 대상에 맞는 토큰/컴포넌트 파일 로드
3. 구현 후 **[`do.md`](./do.md)** 체크리스트로 자가 리뷰
4. 파일 저장 시 PostToolUse hook이 자동으로 금지 패턴 검사

## 핵심 3원칙 (요약)

1. **No-Line**: 섹션 구분에 1px solid border 금지 → 배경 톤 시프트
2. **Tonal Layering**: 그림자 대신 surface 계층으로 깊이 표현
3. **Editorial Authority**: Inter 단일 폰트, 타이포그래피 주도

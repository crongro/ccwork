# 02 — Typography Tokens

> 폰트는 **Inter** 하나만 사용한다. 다른 폰트 혼용 금지.

## 스케일

| 스타일        | 크기      | 용도            | 비고                                   |
| ------------- | --------- | --------------- | -------------------------------------- |
| `display-lg`  | `3.5rem`  | 랜딩 모멘트     | `letter-spacing: -0.02em`              |
| `headline-md` | `1.75rem` | TIL 항목 제목   | `line-height: 1.4`                     |
| `body-lg`     | `1rem`    | 기본 본문       | 롱폼은 `on_surface_variant`            |
| `label-md`    | `0.75rem` | 메타데이터 라벨 | `UPPERCASE`, `letter-spacing: +0.05em` |

## 톤 규칙

- **강조 본문 / 헤드라인**: `on_surface` (#2b3437)
- **롱폼 / 보조 텍스트**: `on_surface_variant` (#586064) — 눈의 피로 완화
- **라벨**: `label-md` + `UPPERCASE` + `+0.05em` — 기능적 메타데이터를 내러티브와 구분

## 금지

- 🚫 Inter 외 다른 폰트
- 🚫 `#000000` 텍스트
- 🚫 장식적 폰트 변형 (italic 남용 등)

# ✅ Do — 반드시 따를 것

## 구조 & 레이아웃

- ✅ **여백을 구조로 사용**한다. 의심스러울 땐 여백을 늘려라.
- ✅ **영역 구분은 배경 톤 시프트**로 처리한다 (사이드바 ↔ 본문 등).
- ✅ **리스트 항목 분리**는 `spacing.4` (1.4rem) 간격으로만.
- ✅ **섹션 블록 간격**은 `spacing.10` (3.5rem).

## 색상

- ✅ **본문 강조 텍스트**는 `on_surface` (#2b3437).
- ✅ **롱폼 본문**은 `on_surface_variant` (#586064) — 눈의 피로 완화.
- ✅ **사이드바 선택 상태**는 `surface_container_highest` (#dbe4e7).
- ✅ **Accent(`tertiary` #0053dc)는 의도된 액션에만** 절제해서 사용 (CTA, focus, 링크).

## 컴포넌트

- ✅ **들뜨는 카드**는 `#ffffff` (`surface_container_lowest`)를 `#eaeff1` (`surface_container`) 위에 겹쳐 표현.
- ✅ **Primary 버튼**은 `tertiary → tertiary_container` 그라디언트.
- ✅ **입력 필드의 선명한 보더**는 focus 시점에만 `tertiary` 1px로 표현.
- ✅ **Chip**은 `surface_container_highest` 배경 + 보더 없음.

## 타이포그래피

- ✅ **Inter** 단일 폰트 사용.
- ✅ **Metadata/라벨**은 `label-md` + `UPPERCASE` + `+0.05em`.
- ✅ **헤드라인**은 `line-height: 1.4` 이상으로 호흡 확보.

## 깊이

- ✅ **기본 깊이**는 Tonal Layering으로 표현.
- ✅ **Ambient Shadow**는 플로팅 요소(모달, 팝오버)에만.

# 04 — Elevation & Depth

## 1. Tonal Layering (기본)

그림자 대신 **톤 레이어**로 들뜬 느낌을 만든다.

`surface_container_lowest` (#ffffff) 카드를 `surface_container` (#eaeff1) 섹션 위에 올리면, 종이가 겹친 듯한 자연스러운 리프트가 생긴다.

## 2. Ambient Shadow (플로팅 요소 한정)

모달, 드롭다운, 팝오버 등 실제로 떠 있어야 하는 요소에만 사용.

- **Blur**: `24px ~ 40px`
- **Opacity**: `on_surface` 6%
- **Tint**: accent 컬러를 살짝 섞어 팔레트 일관성 유지

## 3. Ghost Border (최후의 수단)

접근성 이유로 꼭 경계선이 필요할 때만 사용.

- 색: `outline_variant` (#abb3b7) at **15% opacity**
- "선의 암시"여야 한다. 선명한 1px 금지.

## 금지

- 🚫 기본 `box-shadow: 0 2px 4px rgba(0,0,0,.1)` 같은 "엔지니어링된" 그림자
- 🚫 비-플로팅 요소에 그림자 적용
- 🚫 `border: 1px solid ...` 로 카드 경계 만들기 — Tonal Layering 사용

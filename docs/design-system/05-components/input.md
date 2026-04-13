# Input Field

## 기본

- 배경: `surface_container_lowest` (#ffffff)
- 평상시 보더: **Ghost Border** (`outline_variant` 15% opacity) 1px
- Focus 보더: `tertiary` (#0053dc) 1px
- 텍스트: `on_surface` (#2b3437)
- 모서리: `border-radius: 0.375rem` (md)

## Label

- 스타일: `label-md` (0.75rem, UPPERCASE, `+0.05em` letter-spacing)
- 위치: input 위
- 텍스트 색: `on_surface_variant` (#586064)
- Gap: `spacing.1` (0.35rem)

## 규칙

- ✅ 평상시엔 존재감 없는 Ghost Border
- ✅ Focus 시에만 accent 컬러로 선명해짐
- 🚫 평상시 `border: 1px solid #xxx` 같은 선명한 보더 금지
- 🚫 `outline: none` 후 focus 시각 표시 누락 금지 (접근성)

## 예시

```tsx
<div className="flex flex-col gap-[0.35rem]">
  <label className="text-xs uppercase tracking-[0.05em] text-[#586064]">Title</label>
  <input
    className="bg-white rounded-md px-3 py-2 text-[#2b3437]
               border border-[#abb3b7]/15
               focus:border-[#0053dc] focus:outline-none"
  />
</div>
```

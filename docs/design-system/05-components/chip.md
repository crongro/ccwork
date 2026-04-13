# Chip (Knowledge Token)

태그, 토픽 라벨 등에 사용 — `#javascript`, `#design` 같은 경우.

## 스타일

- 배경: `surface_container_highest` (#dbe4e7)
- 텍스트: `on_surface_variant` (#586064)
- 모서리: `rounded-full` (pill)
- 크기: `label-md` (0.75rem)
- 패딩: 세로 `spacing.1`, 가로 `spacing.2`

## 규칙

- ✅ 배경 톤으로만 구분, 보더 없음
- ✅ UPPERCASE 사용 안 함 (태그는 내러티브 근접)
- 🚫 `border: 1px solid` 추가 금지
- 🚫 배경에 accent(`tertiary`) 사용 금지 — 중성 톤 유지

## 예시

```tsx
<span className="bg-[#dbe4e7] text-[#586064] text-xs rounded-full px-[0.7rem] py-[0.35rem]">
  #javascript
</span>
```

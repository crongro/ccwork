# Card & List

## Card

- 배경: `surface_container_lowest` (#ffffff)
- 깔리는 섹션: `surface_container` (#eaeff1)
- 경계: **Tonal Layering만 사용** (보더/그림자 금지)
- 모서리: `border-radius: 0.375rem` (md)

## List

- **Divider Prohibition**: 리스트 항목 사이에 선을 긋지 않는다.
- 항목 간격: `spacing.4` (1.4rem) 고정
- **Hover**: 배경 `surface` → `surface_container_low` (#f1f4f6)
- **Selected**: 배경 `surface_container_highest` (#dbe4e7)

## 규칙

- ✅ 항목 구분은 여백으로만
- ✅ 선택 상태는 배경 톤 시프트로
- 🚫 `<hr>`, `border-bottom`, `divide-y` 등 divider 유틸 금지
- 🚫 카드에 `box-shadow` 추가 금지
- 🚫 카드에 `border: 1px solid` 추가 금지

## 예시

```tsx
<ul className="flex flex-col gap-[1.4rem]">
  {notes.map((note) => (
    <li className="bg-white hover:bg-[#f1f4f6] rounded-md p-4">...</li>
  ))}
</ul>
```

# Button

## 종류

| 종류                 | 배경                                       | 텍스트                  | 비고                            |
| -------------------- | ------------------------------------------ | ----------------------- | ------------------------------- |
| **Primary**          | `tertiary → tertiary_container` 그라디언트 | `on_tertiary` (#faf8ff) | border-radius `md` (0.375rem)   |
| **Secondary**        | `surface_container_high` (#e2e9ec)         | `on_surface` (#2b3437)  | **보더 없음**                   |
| **Tertiary (Ghost)** | 없음                                       | `tertiary` (#0053dc)    | Hover 시 accent 2% opacity 배경 |

## 규칙

- ✅ Primary는 그라디언트 필수 (평면적 버튼 금지)
- ✅ 모든 버튼 `border-radius: 0.375rem` (md)
- 🚫 버튼에 `border` 추가 금지
- 🚫 Primary 컬러를 장식 목적으로 사용 금지 — 의도된 액션에만

## 예시

```tsx
// Primary
<button className="bg-gradient-to-r from-[#0053dc] to-[#3e76fe] text-[#faf8ff] rounded-md px-4 py-2">
  저장
</button>

// Secondary
<button className="bg-[#e2e9ec] text-[#2b3437] rounded-md px-4 py-2">
  취소
</button>
```

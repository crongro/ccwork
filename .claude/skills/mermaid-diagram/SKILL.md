---
name: mermaid-diagram
description: >
  Analyze the src/ directory of a React/TypeScript project and generate a Mermaid-based architecture
  visualization as an HTML file, then open it in the browser. Use when the user asks to visualize
  project architecture, component dependencies, state flow, or data flow using Mermaid diagrams.
  Triggers on requests like "아키텍처 시각화", "컴포넌트 의존성 다이어그램", "mermaid diagram 생성",
  "프로젝트 구조 시각화", or any request to generate architecture docs as HTML.
---

# Mermaid Architecture Diagram

## Workflow

1. **Analyze** — Read all `src/**/*.{ts,tsx}` files to extract:
   - Component render tree (who renders who)
   - Props passed between components (name + type)
   - Context/hook usage (`useXxx()` calls)
   - API call locations
   - State locations and what they hold

2. **Generate** — Create `docs/architecture/index.html` with three Mermaid diagrams:
   - **Component Tree** (`graph TD`): render hierarchy + props on edges
   - **Data Flow** (`flowchart LR`): user action → component → context → API → server → state update → re-render
   - **State Map** (`graph TB`): 3-layer state (server state / UI state / local form state) with variable names

3. **Open** — Run `open docs/architecture/index.html` (macOS)

## HTML Template

Use the Mermaid CDN. Wrap each diagram in a `<section>` with a heading.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Architecture</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
  <style>
    body { font-family: sans-serif; max-width: 1200px; margin: 40px auto; padding: 0 20px; }
    section { margin-bottom: 60px; }
    h2 { border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .mermaid { background: #f9fafb; border-radius: 8px; padding: 24px; }
  </style>
</head>
<body>
  <h1>Project Architecture</h1>
  <section>
    <h2>1. Component Tree</h2>
    <div class="mermaid"><!-- diagram 1 --></div>
  </section>
  <section>
    <h2>2. Data Flow</h2>
    <div class="mermaid"><!-- diagram 2 --></div>
  </section>
  <section>
    <h2>3. State Map</h2>
    <div class="mermaid"><!-- diagram 3 --></div>
  </section>
</body>
</html>
```

## Diagram Guidelines

- **Edge labels**: use `-- propName -->` or `-- useHook() -->` to show how data moves
- **Subgraphs**: group related nodes (`subgraph Context`, `subgraph API Layer`)
- **Node shapes**: rectangles for components, `[(DB)]` for persistence, `[/state/]` for state values
- **Limit**: ~15 nodes per diagram; split into subgraphs if larger

## Output Path

Write to `docs/architecture/index.html` relative to project root (create dirs if needed).

## Opening the File

After writing, run:
```bash
open docs/architecture/index.html
```

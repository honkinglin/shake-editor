# shake-editor

[![npm version](https://img.shields.io/npm/v/shake-editor?color=a98bff)](https://www.npmjs.com/package/shake-editor) [![CI](https://github.com/honkinglin/shake-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/honkinglin/shake-editor/actions/workflows/ci.yml) [![license](https://img.shields.io/npm/l/shake-editor)](./LICENSE)

Caret particles and subtle shake feedback for text inputs, textareas, and contenteditable editors. Built with Vite and shipped as one dependency with first-class vanilla, React, Vue, and Web Component entry points.

[Live demo](https://shake-editor.vercel.app) · [GitHub](https://github.com/honkinglin/shake-editor)

## Demo

<video src="https://raw.githubusercontent.com/honkinglin/shake-editor/main/shake-editor-demo.mp4" controls width="100%"></video>

[Watch the demo video](./shake-editor-demo.mp4)

The effect is lazy, SSR-friendly in the core/framework entry points, high-DPI aware, capped at 500 particles, and automatically respects `prefers-reduced-motion`.

## Online examples

Each example is a standalone Vite project that opens with a live preview and the relevant source file selected.

| Stack | Source | Run online |
| --- | --- | --- |
| Vanilla TypeScript | [`examples/vanilla`](./examples/vanilla) | [![Open Vanilla in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/honkinglin/shake-editor/tree/main/examples/vanilla?file=src/main.ts&title=shake-editor%20Vanilla) |
| React | [`examples/react`](./examples/react) | [![Open React in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/honkinglin/shake-editor/tree/main/examples/react?file=src/main.tsx&title=shake-editor%20React) |
| Vue | [`examples/vue`](./examples/vue) | [![Open Vue in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/honkinglin/shake-editor/tree/main/examples/vue?file=src/App.vue&title=shake-editor%20Vue) |
| Web Component | [`examples/web-component`](./examples/web-component) | [![Open Web Component in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/fork/github/honkinglin/shake-editor/tree/main/examples/web-component?file=index.html&title=shake-editor%20Web%20Component) |

## Install

```bash
npm install shake-editor
```

React and Vue are optional peer dependencies, so vanilla and Web Component users do not download a framework.

## Vanilla

```ts
import { createShakeEditor } from 'shake-editor';

const editor = document.querySelector<HTMLElement>('#editor')!;
const shake = createShakeEditor(editor, {
  colors: ['#ff4d8d', '#ffcc33', '#43e8d8'],
  particles: { count: [8, 16], size: 3 },
  shake: { intensity: 2.5, duration: 90 },
});

// Optional imperative controls
shake.burst();
shake.update({ shake: false });
shake.destroy();
```

The target can be the editable element itself or a wrapper containing several editable descendants.

## React

```tsx
import { ShakeEditor } from 'shake-editor/react';

export function Editor() {
  return (
    <ShakeEditor
      className="editor-shell"
      options={{ colors: ['#ff4d8d', '#ffcc33', '#43e8d8'] }}
    >
      <textarea defaultValue="Start typing…" />
    </ShakeEditor>
  );
}
```

`ShakeEditor` forwards its ref and all normal `<div>` attributes to the wrapper.

## Vue

```vue
<script setup lang="ts">
import { ShakeEditor } from 'shake-editor/vue';
</script>

<template>
  <ShakeEditor :options="{ colors: ['#ff4d8d', '#ffcc33', '#43e8d8'] }">
    <textarea value="Start typing…" />
  </ShakeEditor>
</template>
```

## Web Component

Importing the entry registers `<shake-editor>` automatically:

```html
<script type="module">
  import 'shake-editor/web-component';
</script>

<shake-editor
  colors="#ff4d8d, #ffcc33, #43e8d8"
  particle-count="12"
  shake-intensity="2.5"
>
  <textarea>Start typing…</textarea>
</shake-editor>
```

Available attributes are `colors`, `particle-count`, `particle-size`, `shake`, `shake-duration`, `shake-intensity`, and `respect-reduced-motion`. Use `shake="false"` to disable shaking. For full configuration, assign the typed `options` property.

If automatic registration is undesirable, import `defineShakeEditor` and call it with a custom tag name.

## Options

```ts
interface ShakeEditorOptions {
  particles?: {
    count?: number | readonly [number, number]; // default: [8, 14]
    size?: number;                              // default: 3
    gravity?: number;                           // default: 0.075
    decay?: number;                             // default: 0.96
    spread?: number;                            // default: 1
    velocity?: number;                          // default: 3.5
  };
  shake?: false | {
    intensity?: number; // default: 2.5
    duration?: number;  // default: 90
  };
  colors?: 'auto' | readonly string[];
  respectReducedMotion?: boolean; // default: true
  zIndex?: number;                // default: 2147483647
}
```

With `colors: 'auto'`, particles inherit the computed text color at the caret. The canvas has `pointer-events: none` and is removed by `destroy()` or framework unmount.

## Develop and publish

```bash
npm install
npm run dev      # local playground
npm run check    # typecheck, tests, production build
npm pack --dry-run
npm publish
```

The package publishes ESM and CommonJS builds plus declarations for all four export paths.

## License

MIT

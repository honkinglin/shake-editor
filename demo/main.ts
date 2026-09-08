import { createShakeEditor } from '../src/core';
import './style.css';

const editor = document.querySelector<HTMLElement>('#editor');
if (editor) {
  createShakeEditor(editor, {
    colors: ['#ff4d8d', '#ffcc33', '#43e8d8', '#8d7dff'],
    particles: { count: [10, 18] },
    shake: { intensity: 2.2 },
  });
}

const examples = {
  vanilla: {
    file: 'main.ts',
    code: `import { createShakeEditor } from 'shake-editor';

const editor = document.querySelector('#editor');

const shake = createShakeEditor(editor, {
  colors: ['#ff4d8d', '#ffcc33', '#43e8d8'],
  particles: { count: [8, 16] },
});

// Later: shake.destroy();`,
  },
  react: {
    file: 'main.tsx',
    code: `import { ShakeEditor } from 'shake-editor/react';

export function App() {
  return (
    <ShakeEditor options={{
      colors: ['#ff4d8d', '#ffcc33', '#43e8d8']
    }}>
      <textarea defaultValue="Start typing…" />
    </ShakeEditor>
  );
}`,
  },
  vue: {
    file: 'App.vue',
    code: `<script setup lang="ts">
import { ShakeEditor } from 'shake-editor/vue';
const options = {
  colors: ['#ff4d8d', '#ffcc33', '#43e8d8']
};
</script>

<template>
  <ShakeEditor :options="options">
    <textarea>Start typing…</textarea>
  </ShakeEditor>
</template>`,
  },
  'web-component': {
    file: 'index.html',
    code: `<script type="module">
  import 'shake-editor/web-component';
</script>

<shake-editor
  colors="#ff4d8d, #ffcc33, #43e8d8"
  particle-count="12"
  shake-intensity="2.5"
>
  <textarea>Start typing…</textarea>
</shake-editor>`,
  },
} as const;

type Framework = keyof typeof examples;
const code = document.querySelector<HTMLElement>('#framework-code');
const filename = document.querySelector<HTMLElement>('#code-file');
const stackblitz = document.querySelector<HTMLAnchorElement>('#stackblitz-link');
const copyCode = document.querySelector<HTMLButtonElement>('#copy-code');
let activeFramework: Framework = 'vanilla';

function stackblitzUrl(framework: Framework): string {
  const file = framework === 'web-component' ? 'index.html' : `src/${examples[framework].file}`;
  const label = framework === 'web-component' ? 'Web Component' : framework[0]?.toUpperCase() + framework.slice(1);
  return `https://stackblitz.com/fork/github/honkinglin/shake-editor/tree/main/examples/${framework}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(`shake-editor ${label}`)}`;
}

function selectFramework(framework: Framework): void {
  activeFramework = framework;
  const example = examples[framework];
  if (code) code.textContent = example.code;
  if (filename) filename.textContent = example.file;
  if (stackblitz) stackblitz.href = stackblitzUrl(framework);
  document.querySelectorAll<HTMLButtonElement>('[data-framework]').forEach((tab) => {
    tab.setAttribute('aria-selected', String(tab.dataset.framework === framework));
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-framework]').forEach((tab) => {
  tab.addEventListener('click', () => selectFramework(tab.dataset.framework as Framework));
});

async function copy(button: HTMLButtonElement, value: string, fallback: string): Promise<void> {
  await navigator.clipboard.writeText(value);
  button.textContent = 'Copied!';
  setTimeout(() => { button.textContent = fallback; }, 1200);
}

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  button.addEventListener('click', () => void copy(button, button.dataset.copy ?? '', 'Copy'));
});

copyCode?.addEventListener('click', () => void copy(copyCode, examples[activeFramework].code, 'Copy code'));
selectFramework(activeFramework);

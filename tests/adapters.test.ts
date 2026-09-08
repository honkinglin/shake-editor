import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { ShakeEditor as ReactShakeEditor } from '../src/react';
import { ShakeEditor as VueShakeEditor } from '../src/vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('framework adapters', () => {
  it('mounts, reacts to input, and unmounts in React', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(createElement(
        ReactShakeEditor,
        { options: { particles: { count: 1 } } },
        createElement('input'),
      ));
    });

    host.querySelector('input')?.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(document.querySelector('[data-shake-editor-canvas]')).not.toBeNull();

    await act(async () => root.unmount());
    expect(document.querySelector('[data-shake-editor-canvas]')).toBeNull();
  });

  it('mounts, reacts to input, and unmounts in Vue', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      render: () => h(
        VueShakeEditor,
        { options: { particles: { count: 1 } } },
        { default: () => h('input') },
      ),
    });

    app.mount(host);
    await nextTick();
    host.querySelector('input')?.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(document.querySelector('[data-shake-editor-canvas]')).not.toBeNull();

    app.unmount();
    expect(document.querySelector('[data-shake-editor-canvas]')).toBeNull();
  });
});

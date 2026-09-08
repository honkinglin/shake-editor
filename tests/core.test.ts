import { afterEach, describe, expect, it, vi } from 'vitest';
import { createShakeEditor, ShakeEditor } from '../src/core';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('createShakeEditor', () => {
  it('emits particles when an editable descendant receives input', () => {
    const root = document.createElement('section');
    const input = document.createElement('input');
    root.append(input);
    document.body.append(root);
    const controller = createShakeEditor(root, { particles: { count: 1 } });

    input.dispatchEvent(new InputEvent('input', { bubbles: true }));

    expect(document.querySelector('[data-shake-editor-canvas]')).toBeInstanceOf(HTMLCanvasElement);
    expect(root.animate).toHaveBeenCalledOnce();
    controller.destroy();
    expect(document.querySelector('[data-shake-editor-canvas]')).toBeNull();
  });

  it('can disable shaking while retaining particles', () => {
    const root = document.createElement('div');
    document.body.append(root);
    const controller = new ShakeEditor(root, { shake: false });

    controller.burst(root);

    expect(root.animate).not.toHaveBeenCalled();
    expect(document.querySelector('[data-shake-editor-canvas]')).not.toBeNull();
    controller.destroy();
  });

  it('honors reduced-motion preferences', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    const root = document.createElement('div');
    document.body.append(root);
    const controller = createShakeEditor(root);

    controller.burst(root);

    expect(document.querySelector('[data-shake-editor-canvas]')).toBeNull();
    controller.destroy();
  });
});

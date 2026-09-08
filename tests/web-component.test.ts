import { afterEach, describe, expect, it } from 'vitest';
import { ShakeEditorElement, defineShakeEditor } from '../src/web-component';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ShakeEditorElement', () => {
  it('registers the shake-editor element once', () => {
    expect(defineShakeEditor()).toBe(ShakeEditorElement);
    expect(customElements.get('shake-editor')).toBe(ShakeEditorElement);
  });

  it('can register an additional custom tag', () => {
    const name = 'power-mode-editor';
    expect(defineShakeEditor(name)).toBe(customElements.get(name));
  });

  it('connects to editable light-DOM children', () => {
    const element = document.createElement('shake-editor');
    const input = document.createElement('input');
    element.append(input);
    document.body.append(element);

    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));

    expect(document.querySelector('[data-shake-editor-canvas]')).not.toBeNull();
    element.remove();
    expect(document.querySelector('[data-shake-editor-canvas]')).toBeNull();
  });
});

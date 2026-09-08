import { createShakeEditor, type ShakeEditorController, type ShakeEditorOptions } from './core';

const TAG_NAME = 'shake-editor';

function booleanAttribute(element: Element, name: string, fallback: boolean): boolean {
  const value = element.getAttribute(name);
  if (value === null) return fallback;
  return value !== 'false';
}

function numberAttribute(element: Element, name: string): number | undefined {
  const value = element.getAttribute(name);
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export class ShakeEditorElement extends HTMLElement {
  static readonly observedAttributes = [
    'colors',
    'particle-count',
    'particle-size',
    'shake',
    'shake-duration',
    'shake-intensity',
    'respect-reduced-motion',
  ];

  private controller: ShakeEditorController | null = null;
  private customOptions: ShakeEditorOptions = {};

  get options(): ShakeEditorOptions {
    return this.customOptions;
  }

  set options(value: ShakeEditorOptions) {
    this.customOptions = value ?? {};
    this.controller?.update(this.resolvedOptions());
  }

  connectedCallback(): void {
    if (!this.style.display) this.style.display = 'block';
    if (!this.controller) this.controller = createShakeEditor(this, this.resolvedOptions());
  }

  disconnectedCallback(): void {
    this.controller?.destroy();
    this.controller = null;
  }

  attributeChangedCallback(): void {
    this.controller?.update(this.resolvedOptions());
  }

  burst(): void {
    this.controller?.burst();
  }

  private resolvedOptions(): ShakeEditorOptions {
    const colors = this.getAttribute('colors')
      ?.split(',')
      .map((color) => color.trim())
      .filter(Boolean);
    const count = numberAttribute(this, 'particle-count');
    const size = numberAttribute(this, 'particle-size');
    const duration = numberAttribute(this, 'shake-duration');
    const intensity = numberAttribute(this, 'shake-intensity');
    const shakeEnabled = booleanAttribute(this, 'shake', true);

    return {
      ...this.customOptions,
      colors: colors?.length ? colors : this.customOptions.colors,
      respectReducedMotion: booleanAttribute(
        this,
        'respect-reduced-motion',
        this.customOptions.respectReducedMotion ?? true,
      ),
      particles: {
        ...this.customOptions.particles,
        ...(count === undefined ? {} : { count }),
        ...(size === undefined ? {} : { size }),
      },
      shake: shakeEnabled
        ? {
            ...(this.customOptions.shake === false ? {} : this.customOptions.shake),
            ...(duration === undefined ? {} : { duration }),
            ...(intensity === undefined ? {} : { intensity }),
          }
        : false,
    };
  }
}

export function defineShakeEditor(tagName = TAG_NAME): CustomElementConstructor {
  const existing = customElements.get(tagName);
  if (existing) return existing;
  const constructor = tagName === TAG_NAME
    ? ShakeEditorElement
    : class CustomShakeEditorElement extends ShakeEditorElement {};
  customElements.define(tagName, constructor);
  return constructor;
}

declare global {
  interface HTMLElementTagNameMap {
    'shake-editor': ShakeEditorElement;
  }
}

if (typeof window !== 'undefined' && 'customElements' in window) defineShakeEditor();

export type { ParticleOptions, ShakeEditorOptions, ShakeOptions } from './core';

export default ShakeEditorElement;

export interface ParticleOptions {
  /** Number of particles emitted for each input event. */
  count: number | readonly [min: number, max: number];
  /** Particle width and height in CSS pixels. */
  size: number;
  /** Downward acceleration applied on every frame. */
  gravity: number;
  /** Alpha multiplier applied on every frame. */
  decay: number;
  /** Initial horizontal velocity range. */
  spread: number;
  /** Initial upward velocity. */
  velocity: number;
}

export interface ShakeOptions {
  /** Maximum translation in CSS pixels. */
  intensity: number;
  /** Animation duration in milliseconds. */
  duration: number;
}

export interface ShakeEditorOptions {
  particles?: Partial<ParticleOptions>;
  shake?: false | Partial<ShakeOptions>;
  /** Use the text color under the caret, or pick from this palette. */
  colors?: 'auto' | readonly string[];
  /** Disable motion when the operating system requests reduced motion. */
  respectReducedMotion?: boolean;
  /** z-index used by the fixed particle canvas. */
  zIndex?: number;
}

export interface ShakeEditorController {
  burst(source?: Element | null): void;
  update(options: ShakeEditorOptions): void;
  destroy(): void;
}

interface Point {
  x: number;
  y: number;
}

interface Particle extends Point {
  alpha: number;
  color: string;
  velocityX: number;
  velocityY: number;
}

interface ResolvedOptions {
  particles: ParticleOptions;
  shake: false | ShakeOptions;
  colors: 'auto' | readonly string[];
  respectReducedMotion: boolean;
  zIndex: number;
}

const DEFAULT_SHAKE: ShakeOptions = { intensity: 2.5, duration: 90 };

const DEFAULTS: ResolvedOptions = {
  particles: {
    count: [8, 14],
    size: 3,
    gravity: 0.075,
    decay: 0.96,
    spread: 1,
    velocity: 3.5,
  },
  shake: DEFAULT_SHAKE,
  colors: 'auto',
  respectReducedMotion: true,
  zIndex: 2_147_483_647,
};

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'tel', 'password', 'email']);

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function resolveOptions(options: ShakeEditorOptions = {}): ResolvedOptions {
  const shake = options.shake;
  return {
    particles: { ...DEFAULTS.particles, ...options.particles },
    shake: shake === false
      ? false
      : {
          intensity: shake?.intensity ?? DEFAULT_SHAKE.intensity,
          duration: shake?.duration ?? DEFAULT_SHAKE.duration,
        },
    colors: options.colors ?? DEFAULTS.colors,
    respectReducedMotion: options.respectReducedMotion ?? DEFAULTS.respectReducedMotion,
    zIndex: options.zIndex ?? DEFAULTS.zIndex,
  };
}

function isTextControl(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement
    || (element instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(element.type));
}

function copyTextControlStyles(source: HTMLElement, mirror: HTMLElement): void {
  const style = window.getComputedStyle(source);
  const properties = [
    'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
    'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
    'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize',
  ] as const;

  for (const property of properties) {
    mirror.style[property] = style[property];
  }
}

function getTextControlCaret(element: HTMLInputElement | HTMLTextAreaElement): Point {
  const mirror = document.createElement('div');
  copyTextControlStyles(element, mirror);
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = element instanceof HTMLInputElement ? 'pre' : 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';

  const caret = element.selectionEnd ?? element.value.length;
  mirror.textContent = element.value.slice(0, caret);
  const marker = document.createElement('span');
  marker.textContent = element.value.slice(caret) || '.';
  mirror.append(marker);
  document.body.append(mirror);

  const sourceRect = element.getBoundingClientRect();
  const computedLineHeight = getComputedStyle(element).lineHeight;
  const lineHeight = Number.parseFloat(computedLineHeight);
  const fallbackLineHeight = Number.parseFloat(getComputedStyle(element).fontSize) * 1.2 || 16;
  const point = {
    x: sourceRect.left + marker.offsetLeft - element.scrollLeft,
    y: sourceRect.top + marker.offsetTop - element.scrollTop + (Number.isFinite(lineHeight) ? lineHeight : fallbackLineHeight),
  };
  mirror.remove();
  return point;
}

function getSelectionCaret(source: Element): Point | null {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;

  const range = selection.getRangeAt(0).cloneRange();
  if (!source.contains(range.startContainer) && source !== range.startContainer) return null;
  range.collapse(true);
  const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
  return rect ? { x: rect.left, y: rect.bottom || rect.top } : null;
}

function getCaret(source: Element): Point {
  if (isTextControl(source)) return getTextControlCaret(source);
  const selectionPoint = getSelectionCaret(source);
  if (selectionPoint) return selectionPoint;

  const rect = source.getBoundingClientRect();
  return { x: rect.left + Math.min(rect.width, 24), y: rect.top + rect.height / 2 };
}

export class ShakeEditor implements ShakeEditorController {
  readonly element: HTMLElement;

  private options: ResolvedOptions;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private frame: number | null = null;
  private destroyed = false;
  private fallbackShakeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly onInput = (event: Event): void => {
    this.burst(event.target instanceof Element ? event.target : null);
  };
  private readonly onResize = (): void => this.resizeCanvas();

  constructor(element: HTMLElement, options: ShakeEditorOptions = {}) {
    if (!(element instanceof HTMLElement)) {
      throw new TypeError('shake-editor requires an HTMLElement target.');
    }
    this.element = element;
    this.options = resolveOptions(options);
    this.element.addEventListener('input', this.onInput);
  }

  update(options: ShakeEditorOptions): void {
    this.options = resolveOptions(options);
    if (this.canvas) this.canvas.style.zIndex = String(this.options.zIndex);
  }

  burst(source: Element | null = document.activeElement): void {
    if (this.destroyed || this.motionIsReduced()) return;
    const target = source && this.element.contains(source) ? source : this.element;
    const point = getCaret(target);
    const color = this.getParticleColor(target);
    const countOption = this.options.particles.count;
    const count = typeof countOption === 'number'
      ? countOption
      : Math.round(randomBetween(countOption[0], countOption[1]));

    for (let index = 0; index < Math.max(0, count); index += 1) {
      this.particles.push({
        ...point,
        alpha: 1,
        color,
        velocityX: randomBetween(-this.options.particles.spread, this.options.particles.spread),
        velocityY: randomBetween(-this.options.particles.velocity, -this.options.particles.velocity * 0.45),
      });
    }
    if (this.particles.length > 500) this.particles.splice(0, this.particles.length - 500);

    this.shake();
    this.ensureCanvas();
    if (this.frame === null) this.frame = requestAnimationFrame(this.render);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.element.removeEventListener('input', this.onInput);
    window.removeEventListener('resize', this.onResize);
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    if (this.fallbackShakeTimer) clearTimeout(this.fallbackShakeTimer);
    this.canvas?.remove();
    this.canvas = null;
    this.context = null;
    this.particles = [];
  }

  private motionIsReduced(): boolean {
    return this.options.respectReducedMotion
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private getParticleColor(source: Element): string {
    const { colors } = this.options;
    if (colors !== 'auto' && colors.length > 0) {
      return colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff';
    }
    return window.getComputedStyle(source).color || '#ffffff';
  }

  private ensureCanvas(): void {
    if (this.canvas) return;
    const canvas = document.createElement('canvas');
    canvas.dataset.shakeEditorCanvas = '';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: String(this.options.zIndex),
    });
    document.body.append(canvas);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * ratio);
    this.canvas.height = Math.round(window.innerHeight * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  private shake(): void {
    if (!this.options.shake) return;
    const { intensity, duration } = this.options.shake;
    const x = randomBetween(-intensity, intensity);
    const y = randomBetween(-intensity, intensity);

    if (typeof this.element.animate === 'function') {
      this.element.animate(
        [{ translate: `${x}px ${y}px` }, { translate: `${-x / 2}px ${-y / 2}px` }, { translate: '0 0' }],
        { duration, easing: 'ease-out' },
      );
      return;
    }

    const previous = this.element.style.translate;
    this.element.style.translate = `${x}px ${y}px`;
    if (this.fallbackShakeTimer) clearTimeout(this.fallbackShakeTimer);
    this.fallbackShakeTimer = setTimeout(() => {
      this.element.style.translate = previous;
      this.fallbackShakeTimer = null;
    }, duration);
  }

  private readonly render = (): void => {
    const context = this.context;
    if (!context) {
      this.frame = null;
      return;
    }

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const { gravity, decay, size } = this.options.particles;
    const alive: Particle[] = [];
    for (const particle of this.particles) {
      particle.velocityY += gravity;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.alpha *= decay;
      if (particle.alpha <= 0.08) continue;

      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.fillRect(Math.round(particle.x - size / 2), Math.round(particle.y - size / 2), size, size);
      alive.push(particle);
    }
    context.globalAlpha = 1;
    this.particles = alive;
    this.frame = alive.length > 0 ? requestAnimationFrame(this.render) : null;
    if (alive.length === 0) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };
}

export function createShakeEditor(
  element: HTMLElement,
  options: ShakeEditorOptions = {},
): ShakeEditorController {
  return new ShakeEditor(element, options);
}

export default createShakeEditor;

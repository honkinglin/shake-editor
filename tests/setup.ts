import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    setTransform: vi.fn(),
    globalAlpha: 1,
    fillStyle: '',
  }),
});

Object.defineProperty(HTMLElement.prototype, 'animate', {
  configurable: true,
  value: vi.fn().mockReturnValue({ cancel: vi.fn() }),
});

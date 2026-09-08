import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createShakeEditor, type ShakeEditorController, type ShakeEditorOptions } from './core';

export interface ShakeEditorProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  options?: ShakeEditorOptions;
}

/** A transparent wrapper that adds shake-editor effects to editable descendants. */
export const ShakeEditor = forwardRef<HTMLDivElement, ShakeEditorProps>(function ShakeEditor(
  { children, options = {}, ...attributes },
  forwardedRef,
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ShakeEditorController | null>(null);

  useImperativeHandle(forwardedRef, () => elementRef.current as HTMLDivElement, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    controllerRef.current = createShakeEditor(element, options);
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.update(options);
  }, [options]);

  return (
    <div {...attributes} ref={elementRef} data-shake-editor="">
      {children}
    </div>
  );
});

export type { ParticleOptions, ShakeEditorOptions, ShakeOptions } from './core';

export default ShakeEditor;

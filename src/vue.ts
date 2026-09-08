import {
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import { createShakeEditor, type ShakeEditorController, type ShakeEditorOptions } from './core';

/** A transparent wrapper that adds shake-editor effects to editable descendants. */
export const ShakeEditor = defineComponent({
  name: 'ShakeEditor',
  inheritAttrs: false,
  props: {
    options: {
      type: Object as PropType<ShakeEditorOptions>,
      default: () => ({}),
    },
  },
  setup(props, { attrs, slots, expose }) {
    const element = ref<HTMLDivElement | null>(null);
    let controller: ShakeEditorController | null = null;

    onMounted(() => {
      if (element.value) controller = createShakeEditor(element.value, props.options);
    });

    watch(
      () => props.options,
      (options) => controller?.update(options),
      { deep: true },
    );

    onBeforeUnmount(() => controller?.destroy());
    expose({ element, burst: () => controller?.burst() });

    return () => h(
      'div',
      mergeProps(attrs, { ref: element, 'data-shake-editor': '' }),
      slots.default?.(),
    );
  },
});

export type { ParticleOptions, ShakeEditorOptions, ShakeOptions } from './core';

export default ShakeEditor;

<script setup lang="ts">
import { ShakeEditor } from 'shake-editor/vue';

const options = {
  colors: ['#42d392', '#ff4d8d', '#ffcc33'],
  particles: { count: [8, 16] as const },
};
</script>

<template>
  <main>
    <p>VUE · SHAKE EDITOR</p>
    <h1>Type something<br />with impact.</h1>
    <ShakeEditor class="editor" :options="options">
      <textarea autofocus>const idea = ref('ready to shake')</textarea>
    </ShakeEditor>
  </main>
</template>

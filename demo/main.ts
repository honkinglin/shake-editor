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

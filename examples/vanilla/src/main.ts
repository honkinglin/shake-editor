import { createShakeEditor } from 'shake-editor';
import './style.css';

const editor = document.querySelector<HTMLElement>('#editor');

if (editor) {
  createShakeEditor(editor, {
    colors: ['#ff4d8d', '#ffcc33', '#43e8d8'],
    particles: { count: [8, 16] },
    shake: { intensity: 2.5, duration: 90 },
  });
}

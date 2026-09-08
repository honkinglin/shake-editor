import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ShakeEditor } from 'shake-editor/react';
import './style.css';

function App() {
  return (
    <main>
      <p>REACT · SHAKE EDITOR</p>
      <h1>Type something<br />with impact.</h1>
      <ShakeEditor
        className="editor"
        options={{
          colors: ['#61dafb', '#ff4d8d', '#ffcc33'],
          particles: { count: [8, 16] },
        }}
      >
        <textarea autoFocus defaultValue="export function BrilliantIdea() {}" />
      </ShakeEditor>
    </main>
  );
}

createRoot(document.querySelector('#root')!).render(<StrictMode><App /></StrictMode>);

import { createRoot } from 'react-dom/client';
import { App } from './App';
import { battleOpened } from './battleModel';
import './style.css';

battleOpened();
createRoot(document.getElementById('root')!).render(<App />);

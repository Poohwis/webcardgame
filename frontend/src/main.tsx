import { createRoot } from 'react-dom/client'
//@ts-ignore
import '@fontsource-variable/pixelify-sans';
import './index.css'
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <App />
)

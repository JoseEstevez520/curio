// Content script: mount Curio's reader into any page, isolated in a Shadow DOM so the page's
// CSS and ours never bleed into each other. All the heavy lifting (describe/generate) happens
// in the background worker via messages; this side is just the UI.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Overlay from './ui/Overlay';
// `?inline` gives the compiled Tailwind CSS as a string, so we can inject it INTO the shadow
// root (a normal CSS import would attach it to the page's <head> and leak / not scope).
import styles from './ui/styles.css?inline';

const HOST_ID = 'curio-ext-root';

if (!document.getElementById(HOST_ID)) {
  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = styles;
  shadow.appendChild(style);

  const mount = document.createElement('div');
  shadow.appendChild(mount);
  document.documentElement.appendChild(host);

  createRoot(mount).render(
    <StrictMode>
      <Overlay />
    </StrictMode>,
  );
}

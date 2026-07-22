/* eslint-disable react-refresh/only-export-components -- popup entry point, not an HMR module */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { OllamaModel } from '@curio/core';
import { STORAGE, type ModelsResult, type PingResult } from './messages';
import './popup.css';

type Status = 'checking' | 'up' | 'down';

function Popup() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<Status>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [model, setModel] = useState('');

  useEffect(() => {
    chrome.storage.local.get([STORAGE.enabled, STORAGE.model]).then((s) => {
      setEnabled(!!s[STORAGE.enabled]);
      if (s[STORAGE.model]) setModel(s[STORAGE.model]);
    });

    (async () => {
      const ping = (await chrome.runtime.sendMessage({ kind: 'ping' })) as PingResult;
      if (!ping.ok || !ping.data) {
        setStatus('down');
        return;
      }
      setStatus('up');
      const res = (await chrome.runtime.sendMessage({ kind: 'models' })) as ModelsResult;
      if (res.ok) {
        setModels(res.data);
        // Default to the stored model, else the first available.
        setModel((m) => m || res.data[0]?.name || '');
      }
    })();
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    chrome.storage.local.set({ [STORAGE.enabled]: next });
  };

  const pickModel = (name: string) => {
    setModel(name);
    // One model for both roles in the extension (no separate fast describer here).
    chrome.storage.local.set({ [STORAGE.model]: name, [STORAGE.describeModel]: name });
  };

  return (
    <div className="wrap">
      <div className="row">
        <span className="brand">Curio</span>
        <button className={`toggle ${enabled ? 'on' : ''}`} onClick={toggle}>
          {enabled ? 'Activo' : 'Desactivado'}
        </button>
      </div>

      <div className={`status ${status === 'up' ? 'ok' : status === 'down' ? 'warn' : ''}`}>
        {status === 'checking' && 'Comprobando Ollama…'}
        {status === 'up' && 'Ollama conectado'}
        {status === 'down' && 'Ollama no responde (o bloquea la extensión)'}
      </div>

      {status === 'up' && (
        <div>
          <label htmlFor="curio-model">Modelo</label>
          <select id="curio-model" value={model} onChange={(e) => pickModel(e.target.value)}>
            {models.length === 0 && <option value="">Sin modelos — haz `ollama pull`</option>}
            {models.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className="row"
        style={{ justifyContent: 'flex-start', gap: 6, color: 'var(--fg-muted)', fontSize: 12 }}
      >
        Selecciona texto en la página (o pulsa <b style={{ color: 'var(--fg)' }}>Alt+C</b> para
        activar).
      </div>

      {status === 'down' && (
        <div className="hint">
          Para que Ollama acepte la extensión, arráncalo permitiendo su origen:
          <br />
          <code>OLLAMA_ORIGINS=chrome-extension://* ollama serve</code>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);

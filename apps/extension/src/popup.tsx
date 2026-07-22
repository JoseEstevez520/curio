/* eslint-disable react-refresh/only-export-components -- popup entry point, not an HMR module */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { OllamaModel } from '@curio/core';
import { STORAGE, type Brain, type StatusResult } from './messages';
import './popup.css';

function Popup() {
  const [enabled, setEnabled] = useState(false);
  const [brain, setBrain] = useState<Brain | 'checking'>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [model, setModel] = useState('');

  useEffect(() => {
    chrome.storage.local.get([STORAGE.enabled, STORAGE.model]).then((s) => {
      setEnabled(!!s[STORAGE.enabled]);
      if (s[STORAGE.model]) setModel(s[STORAGE.model]);
    });

    (async () => {
      const res = (await chrome.runtime.sendMessage({ kind: 'status' })) as StatusResult;
      if (!res.ok) {
        setBrain('none');
        return;
      }
      setBrain(res.data.brain);
      setModels(res.data.models);
      if (res.data.brain === 'ollama') {
        setModel((m) => m || res.data.models[0]?.name || '');
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

  const statusLine =
    brain === 'checking'
      ? 'Comprobando…'
      : brain === 'chrome-ai'
        ? 'IA del navegador (Gemini Nano) · sin configurar nada'
        : brain === 'ollama'
          ? 'Ollama conectado'
          : 'Sin IA disponible';

  return (
    <div className="wrap">
      <div className="row">
        <span className="brand">Curio</span>
        <button className={`toggle ${enabled ? 'on' : ''}`} onClick={toggle}>
          {enabled ? 'Activo' : 'Desactivado'}
        </button>
      </div>

      <div className={`status ${brain === 'none' ? 'warn' : brain === 'checking' ? '' : 'ok'}`}>
        {statusLine}
      </div>

      {brain === 'ollama' && (
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

      {brain === 'none' && (
        <div className="hint">
          Activa <b>Gemini Nano</b> en Chrome (chrome://flags → Prompt API), o arranca Ollama
          permitiendo la extensión:
          <br />
          <code>OLLAMA_ORIGINS=chrome-extension://* ollama serve</code>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);

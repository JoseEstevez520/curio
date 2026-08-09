/* eslint-disable react-refresh/only-export-components -- popup entry point, not an HMR module */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LOCALES, toLocale, DEFAULT_LOCALE, type OllamaModel, type Locale } from '@curio/core';
import { STORAGE, type Brain, type StatusResult } from './messages';
import { t } from './strings';
import './popup.css';

function Popup() {
  const [enabled, setEnabled] = useState(false);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [brain, setBrain] = useState<Brain | 'checking'>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [model, setModel] = useState('');

  const s = t(locale);

  useEffect(() => {
    chrome.storage.local.get([STORAGE.enabled, STORAGE.model, STORAGE.locale]).then((st) => {
      setEnabled(!!st[STORAGE.enabled]);
      setLocale(toLocale(st[STORAGE.locale]));
      if (st[STORAGE.model]) setModel(st[STORAGE.model]);
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

  const pickLocale = (next: Locale) => {
    setLocale(next);
    chrome.storage.local.set({ [STORAGE.locale]: next });
  };

  const pickModel = (name: string) => {
    setModel(name);
    // One model for both roles in the extension (no separate fast describer here).
    chrome.storage.local.set({ [STORAGE.model]: name, [STORAGE.describeModel]: name });
  };

  const statusLine =
    brain === 'checking'
      ? s.checking
      : brain === 'chrome-ai'
        ? s.brainChromeAI
        : brain === 'ollama'
          ? s.brainOllama
          : s.brainNone;

  return (
    <div className="wrap">
      <div className="row">
        <span className="brand">Curio</span>
        <button className={`toggle ${enabled ? 'on' : ''}`} onClick={toggle}>
          {enabled ? s.active : s.disabled}
        </button>
      </div>

      <div className={`status ${brain === 'none' ? 'warn' : brain === 'checking' ? '' : 'ok'}`}>
        {statusLine}
      </div>

      <div className="row">
        <label htmlFor="curio-lang" style={{ color: 'var(--fg-muted)', fontSize: 12 }}>
          {s.language}
        </label>
        <div className="langs" role="group" aria-label={s.language}>
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={locale === l}
              className={`lang ${locale === l ? 'on' : ''}`}
              onClick={() => pickLocale(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {brain === 'ollama' && (
        <div>
          <label htmlFor="curio-model">{s.model}</label>
          <select id="curio-model" value={model} onChange={(e) => pickModel(e.target.value)}>
            {models.length === 0 && <option value="">{s.noModels}</option>}
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
        {s.selectHintPre} <b style={{ color: 'var(--fg)' }}>Alt+C</b> {s.selectHintPost}
      </div>

      {brain === 'none' && (
        <div className="hint">
          {s.enableHint}
          <br />
          <code>OLLAMA_ORIGINS=chrome-extension://* ollama serve</code>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);

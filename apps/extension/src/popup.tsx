/* eslint-disable react-refresh/only-export-components -- popup entry point, not an HMR module */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LOCALES, toLocale, DEFAULT_LOCALE, type OllamaModel, type Locale } from '@curio/core';
import { STORAGE, type Brain, type BrainPref, type StatusResult } from './messages';
import { t } from './strings';
import './popup.css';

/** Derive the host-permission origin pattern (e.g. "https://api.groq.com/*") from a base URL. */
function originPattern(baseUrl: string): string | null {
  try {
    return `${new URL(baseUrl).origin}/*`;
  } catch {
    return null;
  }
}

function Popup() {
  const [enabled, setEnabled] = useState(false);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [brain, setBrain] = useState<Brain | 'checking'>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [model, setModel] = useState('');

  // Cloud (bring-your-own-key) settings.
  const [brainPref, setBrainPref] = useState<BrainPref>('auto');
  const [cloudBaseUrl, setCloudBaseUrl] = useState('');
  const [cloudApiKey, setCloudApiKey] = useState('');
  const [cloudModel, setCloudModel] = useState('');
  const [cloudNote, setCloudNote] = useState('');

  const s = t(locale);

  const refreshStatus = async () => {
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
  };

  useEffect(() => {
    chrome.storage.local
      .get([
        STORAGE.enabled,
        STORAGE.model,
        STORAGE.locale,
        STORAGE.brain,
        STORAGE.cloudBaseUrl,
        STORAGE.cloudApiKey,
        STORAGE.cloudModel,
      ])
      .then((st) => {
        setEnabled(!!st[STORAGE.enabled]);
        setLocale(toLocale(st[STORAGE.locale]));
        if (st[STORAGE.model]) setModel(st[STORAGE.model]);
        setBrainPref(st[STORAGE.brain] === 'cloud' ? 'cloud' : 'auto');
        setCloudBaseUrl(st[STORAGE.cloudBaseUrl] ?? '');
        setCloudApiKey(st[STORAGE.cloudApiKey] ?? '');
        setCloudModel(st[STORAGE.cloudModel] ?? '');
      });
    void refreshStatus();
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

  // Switch brain preference. 'auto' saves immediately; 'cloud' only takes effect once the
  // endpoint is saved (which also requests host access), so here we just reveal the form.
  const pickBrain = (pref: BrainPref) => {
    setBrainPref(pref);
    setCloudNote('');
    if (pref === 'auto') {
      chrome.storage.local.set({ [STORAGE.brain]: 'auto' });
      void refreshStatus();
    }
  };

  // Save the cloud endpoint: request host access for its origin (needs this user gesture), then
  // persist and flip the brain to cloud. Reaching arbitrary endpoints from the background needs
  // the origin granted from optional_host_permissions.
  const saveCloud = async () => {
    const base = cloudBaseUrl.trim().replace(/\/$/, '');
    const mdl = cloudModel.trim();
    if (!base || !mdl) {
      setCloudNote(s.cloudNeedsConfig);
      return;
    }
    const pattern = originPattern(base);
    if (!pattern) {
      setCloudNote(s.cloudNeedsConfig);
      return;
    }
    const granted = await chrome.permissions.request({ origins: [pattern] }).catch(() => false);
    if (!granted) {
      setCloudNote(s.cloudDenied);
      return;
    }
    await chrome.storage.local.set({
      [STORAGE.brain]: 'cloud',
      [STORAGE.cloudBaseUrl]: base,
      [STORAGE.cloudApiKey]: cloudApiKey.trim(),
      [STORAGE.cloudModel]: mdl,
    });
    setCloudNote(s.cloudSaved);
    void refreshStatus();
  };

  const statusLine =
    brain === 'checking'
      ? s.checking
      : brain === 'cloud'
        ? s.brainCloudConnected
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

      <div className="row">
        <label style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{s.brain}</label>
        <div className="langs" role="group" aria-label={s.brain}>
          <button
            type="button"
            aria-pressed={brainPref === 'auto'}
            className={`lang ${brainPref === 'auto' ? 'on' : ''}`}
            onClick={() => pickBrain('auto')}
          >
            {s.brainAuto}
          </button>
          <button
            type="button"
            aria-pressed={brainPref === 'cloud'}
            className={`lang ${brainPref === 'cloud' ? 'on' : ''}`}
            onClick={() => pickBrain('cloud')}
          >
            {s.brainCloud}
          </button>
        </div>
      </div>

      {brainPref === 'cloud' && (
        <div className="cloud">
          <label htmlFor="curio-cloud-base">{s.cloudEndpoint}</label>
          <input
            id="curio-cloud-base"
            type="url"
            placeholder="https://api.groq.com/openai/v1"
            value={cloudBaseUrl}
            onChange={(e) => setCloudBaseUrl(e.target.value)}
          />
          <label htmlFor="curio-cloud-model">{s.cloudModel}</label>
          <input
            id="curio-cloud-model"
            type="text"
            placeholder="openai/gpt-oss-20b"
            value={cloudModel}
            onChange={(e) => setCloudModel(e.target.value)}
          />
          <label htmlFor="curio-cloud-key">{s.cloudKey}</label>
          <input
            id="curio-cloud-key"
            type="password"
            value={cloudApiKey}
            onChange={(e) => setCloudApiKey(e.target.value)}
          />
          <button type="button" className="toggle on" onClick={saveCloud}>
            {s.cloudSave}
          </button>
          {cloudNote && (
            <div className="status" style={{ marginTop: 2 }}>
              {cloudNote}
            </div>
          )}
        </div>
      )}

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

import { useCallback, useEffect, useState } from 'react';
import { useChatStore } from '../app/store';
import { listModels } from '../ollama/models';
import type { OllamaModel } from '../ollama/types';

export type OllamaStatus = 'checking' | 'ok' | 'unreachable' | 'no-models';

/**
 * Load installed Ollama models and track daemon status. Auto-selects a model when
 * the current one is unset or no longer installed. `reload` re-checks on demand.
 */
export function useModels() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [status, setStatus] = useState<OllamaStatus>('checking');

  const load = useCallback(async () => {
    setStatus('checking');
    try {
      const ms = await listModels();
      setModels(ms);
      if (ms.length === 0) {
        setStatus('no-models');
        return;
      }
      setStatus('ok');
      const { model, setModel } = useChatStore.getState();
      if (!model || !ms.some((m) => m.name === model)) setModel(ms[0].name);
    } catch {
      // Any failure to list models means we can't use Ollama — surface the banner.
      setModels([]);
      setStatus('unreachable');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { models, status, reload: load };
}

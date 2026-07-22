import { useCallback, useEffect, useState } from 'react';
import { useChatStore } from '../app/store';
import { listModels } from '@curio/core';
import type { OllamaModel } from '@curio/core';

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
      const { model, describeModel, setModel, setDescribeModel } = useChatStore.getState();
      const isSmall = (name: string) => /[:/](0\.5b|1b|1\.5b)\b/i.test(name);
      const small = ms.find((m) => isSmall(m.name));
      // Chat prefers a larger model; the describer prefers the small, fast one.
      const chatDefault = (ms.find((m) => !isSmall(m.name)) ?? ms[0]).name;
      if (!model || !ms.some((m) => m.name === model)) setModel(chatDefault);
      if (!describeModel || !ms.some((m) => m.name === describeModel)) {
        setDescribeModel(small?.name ?? chatDefault);
      }
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

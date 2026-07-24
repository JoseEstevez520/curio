import { useChatStore } from '../app/store';
import Segmented from './Segmented';

const OPTIONS = [
  { value: false, label: 'Texto' },
  { value: true, label: 'Gen UI' },
];

/**
 * Output-format switch, GLOBAL across surfaces: plain Texto, or Gen UI (chat replies AND the
 * article reader compose Curio's components via OpenUI). Gen UI wants a capable brain (Groq).
 */
export default function GenToggle() {
  const genUI = useChatStore((s) => s.genUI);
  const setGenUI = useChatStore((s) => s.setGenUI);

  return (
    <Segmented
      id="seg-genui"
      ariaLabel="Formato de respuesta"
      options={OPTIONS}
      value={genUI}
      onChange={setGenUI}
    />
  );
}

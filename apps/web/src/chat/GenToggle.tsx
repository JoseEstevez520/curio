import { useChatStore } from '../app/store';
import Segmented from './Segmented';

const OPTIONS = [
  { value: false, label: 'Texto' },
  { value: true, label: 'Gen UI' },
];

/**
 * The one genuine user preference in the header: how the assistant answers — plain Texto, or Gen UI
 * (chat replies AND the article reader compose Curio's components via OpenUI). Global across both
 * surfaces. The brain/model is deploy config (env), not a user toggle, so it isn't here.
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

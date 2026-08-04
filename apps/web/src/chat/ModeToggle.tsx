import { useChatStore, type Mode } from '../app/store';
import Segmented from './Segmented';

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'chat', label: 'Chat' },
  { value: 'read', label: 'Read' },
];

/** Switch between the chat and the article reader. Monochrome segmented control (DESIGN §4). */
export default function ModeToggle() {
  const mode = useChatStore((s) => s.mode);
  const setMode = useChatStore((s) => s.setMode);

  return (
    <Segmented id="seg-mode" ariaLabel="Mode" options={OPTIONS} value={mode} onChange={setMode} />
  );
}

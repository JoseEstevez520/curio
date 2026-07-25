import ChatView from './chat/ChatView';
import OpenUIDemo from './openui/OpenUIDemo';
import Gallery from './openui/Gallery';
import SettingsDemo from './chat/settings/SettingsDemo';

// SPIKE (exp/openui): URL-flagged demo surfaces, so the chat stays untouched in normal use.
//   /?openui → OpenUI composition demo (Groq) · /?gallery → component gallery ·
//   /?settings → the two candidate settings-menu shells, side by side, to pick one.
const params =
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
const openuiDemo = params?.has('openui');
const gallery = params?.has('gallery');
const settingsDemo = params?.has('settings');

export default function App() {
  // Curio's motions are deliberately small and short (§7), so they always play — we don't gate
  // them on the OS "reduce" setting.
  return settingsDemo ? (
    <SettingsDemo />
  ) : gallery ? (
    <Gallery />
  ) : openuiDemo ? (
    <OpenUIDemo />
  ) : (
    <ChatView />
  );
}

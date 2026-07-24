import { MotionConfig } from 'framer-motion';
import ChatView from './chat/ChatView';
import OpenUIDemo from './openui/OpenUIDemo';

// SPIKE (exp/openui): visit `/?openui` to try OpenUI composing Curio's components via Groq.
// Guarded by a URL flag so the chat surface stays untouched on `main`-like usage.
const openuiDemo =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('openui');

export default function App() {
  // reducedMotion="user" makes Framer honor prefers-reduced-motion everywhere:
  // layout/transform animations are skipped for those users.
  return (
    <MotionConfig reducedMotion="user">
      {openuiDemo ? <OpenUIDemo /> : <ChatView />}
    </MotionConfig>
  );
}

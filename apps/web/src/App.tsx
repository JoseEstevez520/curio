import { MotionConfig } from 'framer-motion';
import ChatView from './chat/ChatView';
import OpenUIDemo from './openui/OpenUIDemo';
import Gallery from './openui/Gallery';

// SPIKE (exp/openui): URL-flagged demo surfaces, so the chat stays untouched in normal use.
//   /?openui → OpenUI composition demo (Groq) · /?gallery → deterministic component gallery.
const params =
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
const openuiDemo = params?.has('openui');
const gallery = params?.has('gallery');

export default function App() {
  // reducedMotion="user" makes Framer honor prefers-reduced-motion everywhere:
  // layout/transform animations are skipped for those users.
  return (
    <MotionConfig reducedMotion="user">
      {gallery ? <Gallery /> : openuiDemo ? <OpenUIDemo /> : <ChatView />}
    </MotionConfig>
  );
}

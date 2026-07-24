import { MotionConfig } from 'framer-motion';
import ChatView from './chat/ChatView';
import OpenUIDemo from './openui/OpenUIDemo';
import ChartsLab from './openui/ChartsLab';

// SPIKE (exp/openui): URL-flagged demo surfaces, so the chat stays untouched in normal use.
//   /?openui → OpenUI composition demo · /?charts → SVG-vs-Recharts chart animation lab.
const params =
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
const openuiDemo = params?.has('openui');
const chartsLab = params?.has('charts');

export default function App() {
  // reducedMotion="user" makes Framer honor prefers-reduced-motion everywhere:
  // layout/transform animations are skipped for those users.
  return (
    <MotionConfig reducedMotion="user">
      {chartsLab ? <ChartsLab /> : openuiDemo ? <OpenUIDemo /> : <ChatView />}
    </MotionConfig>
  );
}

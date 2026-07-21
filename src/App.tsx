import { MotionConfig } from 'framer-motion';
import ChatView from './chat/ChatView';

export default function App() {
  // reducedMotion="user" makes Framer honor prefers-reduced-motion everywhere:
  // layout/transform animations are skipped for those users.
  return (
    <MotionConfig reducedMotion="user">
      <ChatView />
    </MotionConfig>
  );
}

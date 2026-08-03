import ChatView from './chat/ChatView';
import OpenUIDemo from './openui/OpenUIDemo';
import Gallery from './openui/Gallery';
import McpAppDemo from './mcp/McpAppDemo';

// SPIKE (exp/openui): URL-flagged demo surfaces, so the chat stays untouched in normal use.
//   /?openui → OpenUI composition demo (Groq) · /?gallery → component gallery.
const params =
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
const openuiDemo = params?.has('openui');
const gallery = params?.has('gallery');
const mcpApp = params?.has('mcp-app');

export default function App() {
  // Curio's motions are deliberately small and short (§7), so they always play — we don't gate
  // them on the OS "reduce" setting.
  return mcpApp ? <McpAppDemo /> : gallery ? <Gallery /> : openuiDemo ? <OpenUIDemo /> : <ChatView />;
}

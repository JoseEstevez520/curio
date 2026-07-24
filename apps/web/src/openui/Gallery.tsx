import { Renderer } from '@openuidev/react-lang';
import { curioLibrary } from './library';
import ClickableSurface from '../reading/clickable';
import { GALLERY_LANG } from './galleryLang';

/**
 * SPIKE (exp/openui) — `/?gallery`: renders the whole catalog from a fixed OpenUI Lang program
 * (no model call) so the components' look/layout can be verified visually and screenshotted.
 * Same renderer + ClickableSurface as a real Gen UI chat reply.
 */
export default function Gallery() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-fg">
          Curio · galería de componentes
        </span>
      </header>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 text-base leading-relaxed text-fg">
        <ClickableSurface messageId="gallery">
          <Renderer response={GALLERY_LANG} library={curioLibrary} />
        </ClickableSurface>
      </div>
    </div>
  );
}

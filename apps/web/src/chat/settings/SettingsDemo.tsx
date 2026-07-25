import { useModels } from '../useModels';
import ThemeToggle from '../../theme/ThemeToggle';
import SettingsAnchored from './SettingsAnchored';
import SettingsCenteredModal from './SettingsCenteredModal';

/**
 * Throwaway compare page (/?settings): the two candidate shells for the settings menu, side by
 * side, so we can feel the open/close motion of each and pick one. Same contents (SettingsContent),
 * only the shell differs. Not linked anywhere — reached by URL flag from App.
 */
function Card({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border">
      {/* A mock header bar so the trigger sits top-right, exactly like the real app. */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-fg">{title}</span>
        <div className="flex items-center gap-3">{children}</div>
      </div>
      <p className="px-4 py-6 text-sm leading-relaxed text-fg-muted">{note}</p>
    </div>
  );
}

export default function SettingsDemo() {
  const { models } = useModels();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">Ajustes — comparativa</h1>
            <p className="mt-2 text-sm text-fg-muted">
              Dos formas de abrir el menú. Clica el icono de cada tarjeta y compara la animación.
              El contenido es el mismo; solo cambia cómo aparece.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-6">
          <Card
            title="A · Popover anclado"
            note="El icono se queda fijo y el panel se despliega justo debajo, creciendo desde la esquina bajo el icono (muelle sin rebote + un toque de desenfoque). Nada desaparece. Cierra con clic fuera o Escape."
          >
            <SettingsAnchored models={models} />
          </Card>

          <Card
            title="B · Modal centrado (grupo que viaja)"
            note="El disparador es un chip «⚙ Ajustes» y ese grupo (icono + texto) viaja junto hasta el título del modal, que aparece en el centro con el fondo atenuado. Ya no vuela un icono solitario. Al cerrar, el título vuelve al chip. Cierra con clic fuera o Escape."
          >
            <SettingsCenteredModal models={models} />
          </Card>
        </div>
      </div>
    </div>
  );
}

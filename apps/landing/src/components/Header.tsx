import { GitHubIcon } from './GitHubIcon';
import { ThemeToggle } from '../theme/ThemeToggle';

/**
 * Sticky header: a real frosted-glass blur, constant. The fill itself is translucent (an alpha
 * color, via color-mix so it still adapts to the dark-mode toggle) — not the whole layer faded
 * with `opacity`, which dims the blur along with it and reads as flat instead of frosted.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-bg)_72%,transparent)] backdrop-blur-md" />
      <div className="relative mx-auto flex max-w-[880px] items-center gap-3 px-5 py-5">
        <span className="font-semibold tracking-tight text-fg">Curio</span>
        <nav className="ml-auto flex items-center gap-4">
          <a
            href="https://github.com/JoseEstevez520/curio"
            className="flex items-center gap-1.5 text-sm text-fg-secondary transition-colors hover:text-fg"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

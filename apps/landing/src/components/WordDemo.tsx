/** A built representation of the click-to-explain loop — not a screenshot of the app. */
export function WordDemo() {
  return (
    <div className="rounded-md border border-border bg-bg-subtle p-6 sm:p-8">
      <p className="max-w-measure text-lg leading-relaxed text-fg">
        In 1543, Copernicus proposed a{' '}
        <span className="group relative inline-block cursor-pointer align-baseline">
          <span className="text-accent transition-colors group-hover:text-accent-hover">
            heliocentric
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 translate-y-1 rounded-md border border-border bg-bg p-3 text-left text-sm leading-snug text-fg-secondary opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <strong className="text-fg">heliocentric</strong> model: Sun-centered. Replaces the
            old geocentric view, where Earth sat still at the middle.
          </span>
        </span>{' '}
        model. The Sun, not Earth, sits at the center.
      </p>
      <p className="mt-5 text-sm text-fg-muted">↳ hover the word</p>
    </div>
  );
}

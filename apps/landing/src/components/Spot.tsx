import { Section } from './Section';

/** The launch spot — the 33s video, not a screenshot of it. */
export function Spot() {
  return (
    <Section>
      <div className="mx-auto max-w-[640px] overflow-hidden rounded-md border border-border bg-bg-subtle">
        <video
          controls
          preload="metadata"
          className="block w-full"
          src="/media/curio-spot.mp4"
        >
          <track kind="captions" />
        </video>
      </div>
    </Section>
  );
}

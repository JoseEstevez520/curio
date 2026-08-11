import { Section, Eyebrow } from './Section';
import { GitHubIcon } from './GitHubIcon';
import { LinkedInIcon } from './LinkedInIcon';

export function Footer() {
  return (
    <Section tint>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <img
            src="/media/jose-mark.png"
            alt=""
            className="h-20 w-20 flex-none object-contain sm:h-24 sm:w-24"
          />
          <div className="text-center sm:text-left">
            <Eyebrow>Built by</Eyebrow>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
              Jose Estevez
            </h2>
            <p className="mt-2 text-fg-secondary">
              for{' '}
              <a href="https://github.com/ANFAIA/SkillNet" className="hover:text-fg">
                SkillNet
              </a>
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-fg-secondary sm:justify-start">
              <a
                href="https://www.linkedin.com/in/jose-est%C3%A9vez-b9b761388"
                className="inline-flex items-center gap-1.5 hover:text-fg"
              >
                <LinkedInIcon className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="https://github.com/JoseEstevez520/curio"
                className="inline-flex items-center gap-1.5 hover:text-fg"
              >
                <GitHubIcon className="h-4 w-4" />
                github.com/JoseEstevez520/curio
              </a>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-[880px] px-5 text-center text-xs text-fg-faint">
          Curio is open source. A proof of concept for{' '}
          <a href="https://github.com/ANFAIA/SkillNet" className="hover:text-fg-muted">
            SkillNet
          </a>
          , built under the{' '}
          <a href="https://www.anfaia.org/" className="hover:text-fg-muted">
            ANFAIA
          </a>{' '}
          2026 scholarship program.
        </p>
    </Section>
  );
}

import { ListChecks, Network, Scale } from 'lucide-react';

const steps = [
  {
    icon: ListChecks,
    title: 'Choose a problem',
    description: 'Pick a real interview prompt from the library and read the brief.',
  },
  {
    icon: Network,
    title: 'Design on canvas',
    description: 'Drag components, connect services, tune traffic, and run chaos sims.',
  },
  {
    icon: Scale,
    title: 'Score your design',
    description: 'Two AI judges debate your architecture and return actionable feedback.',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="border-b border-border/40 bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Three steps from prompt to verdict. No slides, no whiteboard photo uploads.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col gap-4">
              {index < steps.length - 1 ? (
                <span
                  className="absolute left-5 top-12 hidden h-px w-[calc(100%+1.5rem)] bg-border md:block"
                  aria-hidden="true"
                />
              ) : null}
              <div className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                  <step.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="font-mono text-sm text-muted-foreground">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

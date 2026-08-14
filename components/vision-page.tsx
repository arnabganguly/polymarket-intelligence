"use client";

import Link from "next/link";

function FlowChain({
  steps,
  highlightLast = false,
}: {
  steps: string[];
  highlightLast?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isHighlighted = highlightLast && isLast;

        return (
          <div key={step} className="flex flex-col items-center">
            <span
              className={`rounded-2xl border px-6 py-3 text-sm font-semibold tracking-wide sm:text-base ${
                isHighlighted
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-800 shadow-sm"
              }`}
            >
              {step}
            </span>
            {!isLast ? <span className="my-1.5 text-lg text-slate-300">↓</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
      {children}
    </p>
  );
}

function AudienceChip({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={`rounded-full border px-4 py-2 text-sm font-medium ${
        muted
          ? "border-slate-200 bg-white text-slate-500"
          : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
    >
      {label}
    </span>
  );
}

function SurfaceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-surface flex flex-col rounded-3xl p-6">
      <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function VisionPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(41,91,255,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <div className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Header */}
        <div className="mb-14 text-center sm:mb-20">
          <Link
            href="/"
            className="inline-block rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
          >
            ← Back to the market
          </Link>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Product Vision
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl">
            From prediction market
            <br />
            to prediction intelligence
          </h1>
        </div>

        {/* Section 1: Today */}
        <section className="mb-16 sm:mb-24">
          <SectionEyebrow>Today</SectionEyebrow>
          <div className="mt-8 flex justify-center">
            <FlowChain steps={["Event", "Market", "Probability", "Trade"]} />
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-base leading-7 text-slate-600">
            Prediction markets are primarily optimized around helping users express and trade their
            beliefs.
          </p>
        </section>

        {/* Section 2: The Opportunity */}
        <section className="mb-16 sm:mb-24">
          <SectionEyebrow>The Opportunity</SectionEyebrow>
          <div className="mt-8 flex justify-center">
            <FlowChain
              steps={["Event", "Market", "Probability", "Intelligence", "Decision"]}
              highlightLast
            />
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center text-base leading-7 text-slate-600">
            The market already produces a valuable signal.
            <br />
            <span className="font-semibold text-slate-900">
              The Intelligence Layer makes that signal understandable and useful.
            </span>
          </p>
        </section>

        {/* Section 3: Audience expansion */}
        <section className="mb-16 sm:mb-24">
          <SectionEyebrow>Audience Expansion</SectionEyebrow>

          <div className="mt-10 flex flex-col items-center gap-10">
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Today
              </p>
              <AudienceChip label="Traders" />
            </div>

            <span className="text-xl text-slate-300">↓</span>

            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Expanded product
              </p>
              <div className="flex max-w-xl flex-wrap justify-center gap-2.5">
                <AudienceChip label="Traders" />
                <AudienceChip label="Consumers" />
                <AudienceChip label="Investors" />
                <AudienceChip label="Journalists" />
                <AudienceChip label="Businesses" />
                <AudienceChip label="Developers" />
                <AudienceChip label="AI Agents" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Future product surfaces */}
        <section className="mb-16 sm:mb-24">
          <SectionEyebrow>Future Product Surfaces</SectionEyebrow>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <SurfaceCard
              title="Consumer Intelligence"
              description="Understand what the market thinks will happen, why expectations are changing, and what to watch next."
            />
            <SurfaceCard
              title="Pro Intelligence"
              description="Monitor probabilities, catalysts, market movements, and signal quality across topics."
            />
            <SurfaceCard
              title="Probability API"
              description="Allow applications, developers, and AI agents to consume structured, real-time probability intelligence."
            />
          </div>
        </section>

        {/* Closing statement */}
        <section className="border-t border-slate-200 pt-14 text-center sm:pt-16">
          <p className="mx-auto max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl">
            The market produces the signal.
            <br />
            The Intelligence Layer makes it useful.
          </p>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";

type LoopStage = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  angle: number; // degrees, 0 = top, clockwise
};

const LOOP_STAGES: LoopStage[] = [
  {
    id: "understand",
    eyebrow: "Understand",
    title: "Market Intelligence",
    detail: "Why · Signal Quality · What Next",
    angle: 0,
  },
  {
    id: "participate",
    eyebrow: "Participate",
    title: "One-Click Access",
    detail: "Simple onboarding · Invisible Web3",
    angle: 90,
  },
  {
    id: "return",
    eyebrow: "Return",
    title: "Live Markets",
    detail: "More moments · Trading automation",
    angle: 180,
  },
  {
    id: "distribute",
    eyebrow: "Distribute",
    title: "Probability Everywhere",
    detail: "Media · Widgets · APIs · AI Agents",
    angle: 270,
  },
];

function polar(angleDeg: number, radius: number) {
  // 0deg = top, clockwise
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  };
}

function LoopStageCard({ stage, radius }: { stage: LoopStage; radius: number }) {
  const { x, y } = polar(stage.angle, radius);
  return (
    <div
      className="absolute w-[168px] -translate-x-1/2 -translate-y-1/2 sm:w-[188px]"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="card-surface rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
          {stage.eyebrow}
        </p>
        <p className="mt-1 text-sm font-semibold tracking-tight text-slate-950 sm:text-[15px]">
          {stage.title}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs">{stage.detail}</p>
      </div>
    </div>
  );
}

function LoopArrow({ fromAngle, toAngle, radius }: { fromAngle: number; toAngle: number; radius: number }) {
  // place a small chevron at the midpoint of the arc between two stages, rotated to point clockwise
  const midAngle = fromAngle + (((toAngle - fromAngle + 360) % 360) / 2);
  const { x, y } = polar(midAngle, radius);
  return (
    <div
      className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
      style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${midAngle}deg)` }}
    >
      <span className="text-xs leading-none" style={{ transform: `rotate(${-midAngle}deg)` }}>
        ➜
      </span>
    </div>
  );
}

export function VisionPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(41,91,255,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-14">
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
            to prediction network
          </h1>
        </div>

        {/* Circular growth loop */}
        <section className="mb-10 sm:mb-14">
          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            {/* connecting ring */}
            <div className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-blue-200" />

            {/* stage cards */}
            {LOOP_STAGES.map((stage) => (
              <LoopStageCard key={stage.id} stage={stage} radius={44} />
            ))}

            {/* directional arrows between stages, on the ring */}
            {LOOP_STAGES.map((stage, index) => {
              const next = LOOP_STAGES[(index + 1) % LOOP_STAGES.length];
              return (
                <LoopArrow
                  key={`arrow-${stage.id}`}
                  fromAngle={stage.angle}
                  toAngle={next.angle}
                  radius={31}
                />
              );
            })}

            {/* center flywheel */}
            <div className="absolute left-1/2 top-1/2 flex w-[132px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border border-purple-200 bg-purple-50/80 px-3 py-3 text-center shadow-sm sm:w-[150px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                More users
              </p>
              <span className="text-[10px] text-purple-400">↓</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                More participation
              </p>
              <span className="text-[10px] text-purple-400">↓</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                Deeper liquidity
              </p>
              <span className="text-[10px] text-purple-400">↓</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                Stronger signals
              </p>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-md text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Stronger signals → more useful intelligence → a stronger loop
          </p>
        </section>

        {/* Closing statement */}
        <section className="border-t border-slate-200 pt-10 text-center sm:pt-12">
          <p className="mx-auto max-w-2xl text-xl font-semibold leading-snug tracking-tight text-slate-950 sm:text-2xl">
            The market produces the signal.
            <br />
            Intelligence makes it useful.
            <br />
            Distribution makes it ubiquitous.
          </p>
        </section>
      </div>
    </main>
  );
}

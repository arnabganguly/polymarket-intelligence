"use client";

import { useMemo, useState, type JSX } from "react";
import Link from "next/link";
import {
  askQuestions,
  catalysts,
  chartEvents,
  cut25History,
  defaultOutcomeId,
  getOutcome,
  marketDrivers,
  marketMeta,
  movingSummary,
  outcomes,
  signalMetrics,
  signalQualityExplainer,
  signalQualityRating,
  signalQualityTiers,
  type AskQuestion,
  type Catalyst,
  type ChartEvent,
  type DriverDirection,
  type HistoryPoint,
  type MarketDriver,
  type Outcome,
  type OutcomeId,
  type SignalMetric,
} from "@/lib/fed-rate-market";

type Experience = "current" | "intelligence";

function InfoTooltip({ text, label = "More information" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none text-slate-500 outline-none hover:border-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        i
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-950 px-3 py-2.5 text-xs leading-5 text-slate-100 shadow-xl"
        >
          {text}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-slate-950" />
        </span>
      ) : null}
    </span>
  );
}

function formatCents(value: number) {
  return `${Math.round(value * 100)}¢`;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Only the selected "Cut 25 bps" outcome ships with an explicit history in the
// spec. Other outcomes get a short, clearly-synthetic walk toward their
// current probability so the chart never breaks when a user explores them.
function historyFor(outcome: Outcome): HistoryPoint[] {
  if (outcome.id === "cut-25") {
    return cut25History;
  }

  const labels = ["2 weeks ago", "10 days ago", "7 days ago", "5 days ago", "3 days ago", "Yesterday", "Today"];
  const start = Math.max(1, Math.round(outcome.probability * 0.65));

  return labels.map((label, index) => {
    const t = index / (labels.length - 1);
    const probability = Math.round(start + (outcome.probability - start) * t);

    return { label, probability };
  });
}

function chartGeometry(points: HistoryPoint[], large = false) {
  const width = 720;
  const height = large ? 300 : 220;
  const paddingX = 20;
  const paddingTop = 20;
  const paddingBottom = 32;
  const max = Math.min(100, Math.max(...points.map((p) => p.probability)) + 6);
  const min = Math.max(0, Math.min(...points.map((p) => p.probability)) - 6);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;

  const coordinates = points.map((point, index) => {
    const x = paddingX + (index / (points.length - 1)) * usableWidth;
    const y = paddingTop + ((max - point.probability) / Math.max(max - min, 1)) * usableHeight;

    return { ...point, x, y };
  });

  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${paddingX},${height - paddingBottom} ${line} ${width - paddingX},${height - paddingBottom}`;

  return { coordinates, line, area, width, height, max, min };
}

const CAUSAL_CHAIN_STEPS = [
  "Real-world information",
  "Traders update their beliefs",
  "Trading behavior changes",
  "Market price changes",
  "Implied probability changes",
];

function EventExplanationCard({ event, onClose }: { event: ChartEvent; onClose: () => void }) {
  const movement = event.afterProbability - event.beforeProbability;

  return (
    <div
      role="dialog"
      aria-label={`${event.headline} explanation`}
      className="absolute inset-x-0 bottom-full z-40 mb-3 origin-bottom rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:inset-x-auto sm:w-[360px]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            Event marker · {event.dateLabel}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{event.headline}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close explanation"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-800"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Before</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{event.beforeProbability}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">After</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{event.afterProbability}%</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Movement</p>
          <p className={`mt-1 text-sm font-semibold ${movement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {movement >= 0 ? "+" : ""}
            {movement} pts
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm leading-6 text-slate-600">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            What happened
          </p>
          <p className="mt-1">{event.whatHappened}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Why it mattered
          </p>
          <p className="mt-1">{event.whyItMattered}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3">
        <div className="flex flex-col items-center gap-1">
          {CAUSAL_CHAIN_STEPS.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {step}
              </span>
              {index < CAUSAL_CHAIN_STEPS.length - 1 ? (
                <span className="my-0.5 text-slate-400">↓</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-400">
        Fictional demonstration analysis for prototype purposes only.
      </p>
    </div>
  );
}

function ProbabilityHistoryChart({
  outcome,
  experience,
  presentationMode = false,
  activeEventId: controlledActiveEventId,
  onActiveEventChange,
}: {
  outcome: Outcome;
  experience: Experience;
  presentationMode?: boolean;
  activeEventId?: string | null;
  onActiveEventChange?: (id: string | null) => void;
}) {
  const points = useMemo(() => historyFor(outcome), [outcome]);
  const { coordinates, line, area, width, height, max, min } = useMemo(
    () => chartGeometry(points, presentationMode),
    [points, presentationMode],
  );
  const first = points[0];
  const last = points[points.length - 1];
  const change = last.probability - first.probability;

  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [internalActiveEventId, setInternalActiveEventId] = useState<string | null>(null);
  const activeEventId = controlledActiveEventId !== undefined ? controlledActiveEventId : internalActiveEventId;
  const setActiveEventId = (updater: string | null | ((current: string | null) => string | null)) => {
    const next = typeof updater === "function" ? updater(activeEventId) : updater;
    if (onActiveEventChange) {
      onActiveEventChange(next);
    } else {
      setInternalActiveEventId(next);
    }
  };

  const showEvents = experience === "intelligence" && outcome.id === "cut-25";
  const eventsByPoint = useMemo(() => {
    const map = new Map<string, ChartEvent>();
    if (showEvents) {
      chartEvents.forEach((event) => map.set(event.pointLabel, event));
    }
    return map;
  }, [showEvents]);
  const activeEvent = activeEventId ? chartEvents.find((event) => event.id === activeEventId) ?? null : null;

  return (
    <div className={`card-surface rounded-3xl p-5 lg:p-6 ${presentationMode ? "lg:p-7" : ""}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Probability history</p>
          <h2
            className={`mt-1 font-semibold text-slate-950 ${
              presentationMode ? "text-xl lg:text-2xl" : "text-lg"
            }`}
          >
            &ldquo;{outcome.label}&rdquo; over the last two weeks
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-right">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">2-week change</p>
          <p className={`mt-1 text-lg font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {change >= 0 ? "+" : ""}
            {change} pts
          </p>
        </div>
      </div>

      <div className="relative overflow-visible rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(41,91,255,0.10),rgba(255,255,255,0.85))] p-3">
        {activeEvent ? (
          <EventExplanationCard event={activeEvent} onClose={() => setActiveEventId(null)} />
        ) : null}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`w-full overflow-visible ${presentationMode ? "h-[300px]" : "h-[220px]"}`}
        >
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = 20 + ratio * (height - 32 - 20);

            return (
              <line
                key={ratio}
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(148, 163, 184, 0.18)"
                strokeDasharray="4 6"
              />
            );
          })}

          <polygon fill="rgba(41, 91, 255, 0.13)" points={area} />
          <polyline
            fill="none"
            stroke="rgba(41, 91, 255, 0.95)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            points={line}
          />

          {coordinates.map((point) => {
            const event = eventsByPoint.get(point.label);
            const isHovered = hoveredLabel === point.label;

            return (
              <g key={point.label}>
                {/* Larger invisible hit area for easier hover/click */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="14"
                  fill="transparent"
                  onMouseEnter={() => setHoveredLabel(point.label)}
                  onMouseLeave={() => setHoveredLabel((current) => (current === point.label ? null : current))}
                  onClick={() => {
                    if (event) {
                      setActiveEventId((current) => (current === event.id ? null : event.id));
                    }
                  }}
                  className={event ? "cursor-pointer" : "cursor-default"}
                />

                {event ? (
                  <>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered || activeEventId === event.id ? "10" : "8.5"}
                      fill="rgba(245, 158, 11, 0.16)"
                      stroke="rgba(217, 119, 6, 0.9)"
                      strokeWidth="2"
                      className="pointer-events-none transition-all"
                    />
                    <text
                      x={point.x}
                      y={point.y - 16}
                      fill="rgba(180, 83, 9, 0.95)"
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                    >
                      ★
                    </text>
                  </>
                ) : null}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "6.5" : "5"}
                  fill="white"
                  stroke="rgba(41, 91, 255, 0.95)"
                  strokeWidth="3"
                  className="pointer-events-none transition-all"
                />

                {isHovered ? (
                  <g className="pointer-events-none">
                    <rect
                      x={point.x - 46}
                      y={point.y - 46}
                      width="92"
                      height="34"
                      rx="8"
                      fill="rgba(15, 23, 42, 0.95)"
                    />
                    <text x={point.x} y={point.y - 30} fill="white" fontSize="10" textAnchor="middle" fontWeight="600">
                      {point.label}
                    </text>
                    <text x={point.x} y={point.y - 17} fill="rgba(226, 232, 240, 0.95)" fontSize="10" textAnchor="middle">
                      {point.probability}% probability
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {coordinates.map((point, index) => (
            <text
              key={`label-${point.label}`}
              x={point.x}
              y={height - 10}
              fill="rgba(100, 116, 139, 0.92)"
              fontSize="10.5"
              textAnchor={index === 0 ? "start" : index === coordinates.length - 1 ? "end" : "middle"}
            >
              {point.label}
            </text>
          ))}

          <text x={width - 4} y="16" fill="rgba(100, 116, 139, 0.92)" fontSize="11" textAnchor="end">
            {max}%
          </text>
          <text x={width - 4} y={height - 32 + 12} fill="rgba(100, 116, 139, 0.92)" fontSize="11" textAnchor="end">
            {min}%
          </text>
        </svg>
      </div>

      {showEvents ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          <span className="mr-1 text-amber-600">★</span>
          Click a highlighted marker to see the fictional demo analysis behind that move. Hover any
          point for its date and probability.
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {experience === "intelligence" ? (
          <>
            The market-implied probability of this outcome has moved from {first.probability}% to{" "}
            {last.probability}% over the last two weeks. See the intelligence layer below for the
            demo analysis behind this move.
          </>
        ) : (
          <>
            The market-implied probability of this outcome has moved from {first.probability}% to{" "}
            {last.probability}% over the last two weeks — but nothing on this screen explains why.
          </>
        )}
      </p>
    </div>
  );
}

function OutcomesCard({
  selectedId,
  onSelect,
}: {
  selectedId: OutcomeId;
  onSelect: (id: OutcomeId) => void;
}) {
  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Mutually exclusive outcomes</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Choose an outcome to trade</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-500">
          Sums to 100%
        </span>
      </div>

      <div className="space-y-2.5">
        {outcomes.map((outcome) => {
          const active = outcome.id === selectedId;

          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => onSelect(outcome.id)}
              className={`w-full rounded-2xl border p-4 text-left ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                  : "border-slate-200 bg-white/80 text-slate-950 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{outcome.label}</p>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                    Yes {formatCents(outcome.yesPrice)} · No {formatCents(outcome.noPrice)}
                  </span>
                  <span className="text-xl font-semibold tabular-nums">{outcome.probability}%</span>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200/80">
                <div
                  className={`h-2 rounded-full ${active ? "bg-white" : "bg-slate-950"}`}
                  style={{ width: `${outcome.probability}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceToggle({
  experience,
  onChange,
  presentationMode = false,
}: {
  experience: Experience;
  onChange: (experience: Experience) => void;
  presentationMode?: boolean;
}) {
  const isIntelligence = experience === "intelligence";

  return (
    <div
      className={`card-surface overflow-hidden rounded-2xl ${
        presentationMode ? "ring-2 ring-blue-200" : ""
      }`}
    >
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {!presentationMode ? (
          <div>
            <p className="text-sm font-medium text-slate-500">Choose how to view this market</p>
            <p className="mt-0.5 text-xs text-slate-400">
              The underlying market, prices, and history are identical in both views.
            </p>
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}

        <div
          className={`relative flex rounded-full border border-slate-200 bg-slate-50 p-1 ${
            presentationMode ? "mx-auto sm:mx-0" : ""
          }`}
        >
          <span
            aria-hidden
            className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-slate-950 shadow-sm transition-transform duration-300 ease-out ${
              isIntelligence ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
            }`}
          />
          {(
            [
              { id: "current" as const, label: "Current Experience" },
              { id: "intelligence" as const, label: "Intelligent Experience" },
            ]
          ).map((option) => {
            const active = option.id === experience;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className={`relative z-10 rounded-full font-semibold transition-colors duration-200 ${
                  presentationMode ? "px-5 py-2.5 text-base" : "px-4 py-2 text-sm"
                } ${active ? "text-white" : "text-slate-500 hover:text-slate-950"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          isIntelligence ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-center">
            {[
              "What does the market believe?",
              "Why?",
              "How strong is the signal?",
              "What could change it?",
            ].map((term, index) => (
              <span key={term} className="flex items-center gap-2.5">
                {index > 0 ? <span className="text-sm font-semibold text-slate-300">+</span> : null}
                <span
                  className="thesis-term-in rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 sm:text-sm"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  {term}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function directionStyles(direction: DriverDirection) {
  switch (direction) {
    case "positive":
      return {
        badge: "POSITIVE ↑",
        tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    case "negative":
      return {
        badge: "NEGATIVE ↓",
        tone: "text-rose-700 bg-rose-50 border-rose-200",
      };
    default:
      return {
        badge: "MIXED",
        tone: "text-amber-700 bg-amber-50 border-amber-200",
      };
  }
}

function DriverCard({ driver, index }: { driver: MarketDriver; index: number }) {
  const styles = directionStyles(driver.direction);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
            {index + 1}
          </span>
          <p className="text-sm font-semibold text-slate-950">{driver.headline}</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-400">{driver.dateLabel}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{driver.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{driver.impactLabel}:</span>
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.tone}`}>
            {styles.badge}
          </span>
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-xs italic text-slate-400">
        {driver.source}
      </p>
    </div>
  );
}

function WhyMovingCard() {
  return (
    <div id="why-moving" className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Question 1 of 3</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Why is this market moving?</h2>
        </div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Prototype analysis · fictional example
        </span>
      </div>

      <p className="text-sm leading-6 text-slate-600">{movingSummary}</p>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        This explanation and the drivers below are illustrative demo content only. They show how this
        product would explain a probability move if it were connected to real economic data and real
        Fed communications — they are not real economic information or actual Fed commentary.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {marketDrivers.map((driver, index) => (
          <DriverCard key={driver.id} driver={driver} index={index} />
        ))}
      </div>
    </div>
  );
}

function favorabilityTone(favorability: number) {
  if (favorability >= 75) {
    return { bar: "bg-emerald-500", text: "text-emerald-700" };
  }

  if (favorability >= 50) {
    return { bar: "bg-amber-500", text: "text-amber-700" };
  }

  return { bar: "bg-rose-500", text: "text-rose-700" };
}

function SignalMetricRow({ metric }: { metric: SignalMetric }) {
  const tone = favorabilityTone(metric.favorability);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-slate-600">{metric.label}</p>
          {metric.tooltip ? <InfoTooltip text={metric.tooltip} label={`About ${metric.label}`} /> : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-950">{metric.value}</p>
          {metric.note ? <p className="text-[11px] text-slate-400">{metric.note}</p> : null}
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full ${tone.bar}`}
          style={{ width: `${metric.favorability}%` }}
        />
      </div>
    </div>
  );
}

function SignalQualityCard() {
  const tierIndex = signalQualityTiers.indexOf(signalQualityRating);

  return (
    <div id="signal-quality" className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Question 2 of 3</p>
          <div className="mt-1 flex items-center gap-1.5">
            <h2 className="text-xl font-semibold text-slate-950">Signal Quality</h2>
            <InfoTooltip text={signalQualityExplainer} label="About Signal Quality" />
          </div>
        </div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Prototype analysis · fictional example
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Signal quality
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-400">
            {signalQualityRating.toUpperCase()}
          </p>

          <div className="mt-4 flex gap-1.5">
            {signalQualityTiers.map((tier, index) => (
              <div
                key={tier}
                className={`h-1.5 flex-1 rounded-full ${
                  index <= tierIndex ? "bg-emerald-400" : "bg-white/12"
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
            <span>Weak</span>
            <span>Very strong</span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            This market shows the characteristics of healthy, credible price discovery: ample
            liquidity, a tight spread, and activity spread across many participants.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {signalMetrics.map((metric) => (
            <SignalMetricRow key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Signal Quality is a demo illustration of market characteristics for this prototype. It is
        not a prediction, a recommendation, or a guarantee of accuracy.
      </p>
    </div>
  );
}

function categoryTone(category: Catalyst["category"]) {
  switch (category) {
    case "Data release":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "Fed communication":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-slate-300 bg-slate-100 text-slate-700";
  }
}

function CatalystRow({ catalyst, isLast }: { catalyst: Catalyst; isLast: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[132px_minmax(0,1fr)]">
      <div className="relative flex flex-row items-start gap-3 lg:flex-col lg:items-start lg:gap-0">
        <div
          className={`rounded-2xl border px-3 py-2 ${
            catalyst.isResolutionEvent
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-slate-200 bg-slate-50 text-slate-950"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-[0.14em] ${
              catalyst.isResolutionEvent ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {catalyst.relativeLabel}
          </p>
          <p className="mt-1 text-base font-semibold">{catalyst.dateLabel}</p>
        </div>
        {!isLast ? (
          <div className="ml-6 mt-2 hidden w-px flex-1 bg-slate-200 lg:block" aria-hidden="true" />
        ) : null}
      </div>

      <div
        className={`rounded-[1.75rem] border p-4 ${
          catalyst.isResolutionEvent ? "border-slate-950/15 bg-slate-950 text-white" : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{catalyst.title}</h3>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              catalyst.isResolutionEvent
                ? "border-white/20 bg-white/10 text-slate-100"
                : categoryTone(catalyst.category)
            }`}
          >
            {catalyst.category}
          </span>
          {catalyst.isResolutionEvent ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              Market resolves here
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          <p
            className={`text-xs font-medium uppercase tracking-[0.14em] ${
              catalyst.isResolutionEvent ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Why it matters
          </p>
          <p className={`mt-1 text-sm leading-6 ${catalyst.isResolutionEvent ? "text-slate-300" : "text-slate-600"}`}>
            {catalyst.whyItMatters}
          </p>
        </div>

        {catalyst.scenarios ? (
          <div className="mt-4">
            <p
              className={`text-xs font-medium uppercase tracking-[0.14em] ${
                catalyst.isResolutionEvent ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Potential impact
            </p>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {catalyst.scenarios.map((scenario) => (
                <div
                  key={scenario.label}
                  className={`rounded-2xl p-3 ${
                    catalyst.isResolutionEvent ? "bg-white/8" : "bg-slate-50"
                  }`}
                >
                  <p className={`text-sm font-semibold ${catalyst.isResolutionEvent ? "text-white" : "text-slate-900"}`}>
                    {scenario.label}
                  </p>
                  <p className={`mt-1 text-sm ${catalyst.isResolutionEvent ? "text-slate-300" : "text-slate-600"}`}>
                    {scenario.effect}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CatalystTimelineCard() {
  return (
    <div id="whats-next" className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Question 3 of 3</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">What could move this market next?</h2>
        </div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Demonstration data · fictional dates
        </span>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        These are the upcoming events most likely to change this probability again, in chronological
        order — so you know what to watch next if you care about this prediction.
      </p>

      <div className="mt-6 space-y-6">
        {catalysts.map((catalyst, index) => (
          <CatalystRow key={catalyst.id} catalyst={catalyst} isLast={index === catalysts.length - 1} />
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Dates, events, and scenario framing above are fictional demonstration content for this
        prototype. They do not reflect a real economic calendar or confirmed Federal Reserve
        schedule.
      </p>
    </div>
  );
}

function IntelligenceLayerSection({
  askActiveId,
  onAskActiveChange,
}: {
  askActiveId?: string | null;
  onAskActiveChange?: (id: string | null) => void;
}) {
  const cards: Array<{ key: string; render: () => JSX.Element }> = [
    { key: "why-moving", render: () => <WhyMovingCard /> },
    { key: "signal-quality", render: () => <SignalQualityCard /> },
    { key: "catalysts", render: () => <CatalystTimelineCard /> },
    {
      key: "ask",
      render: () => <AskThisMarket activeId={askActiveId} onActiveChange={onAskActiveChange} />,
    },
  ];

  return (
    <div className="space-y-6">
      {cards.map((card, index) => (
        <div key={card.key} className="intel-reveal" style={{ animationDelay: `${index * 90}ms` }}>
          {card.render()}
        </div>
      ))}
    </div>
  );
}

function AskAnswerVisual({ question }: { question: AskQuestion }) {
  const { visual } = question;
  if (!visual) return null;

  if (visual.kind === "probability-move") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Before</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{visual.from}%</p>
        </div>
        <span className="text-slate-400">→</span>
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Now</p>
          <p className="mt-1 text-lg font-semibold text-emerald-600">{visual.to}%</p>
        </div>
        <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          +{visual.to - visual.from} pts
        </span>
      </div>
    );
  }

  if (visual.kind === "target-gap") {
    const gap = visual.to - visual.from;
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Today: {visual.from}%</span>
          <span>Target: {visual.to}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${(visual.from / visual.to) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Would need another <span className="font-semibold text-slate-700">+{gap} points</span> of
          movement in this demonstration.
        </p>
      </div>
    );
  }

  if (visual.kind === "signal-meter") {
    const tierIndex = signalQualityTiers.indexOf(signalQualityRating);
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">Signal Quality</p>
          <p className="text-sm font-semibold text-slate-900">{signalQualityRating}</p>
        </div>
        <div className="mt-2 flex gap-1.5">
          {signalQualityTiers.map((tier, index) => (
            <span
              key={tier}
              className={`h-1.5 flex-1 rounded-full ${
                index <= tierIndex ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (visual.kind === "catalyst-list") {
    return (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        {catalysts.map((catalyst) => (
          <div key={catalyst.id} className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">{catalyst.title}</span>
            <span className="text-slate-500">{catalyst.relativeLabel}</span>
          </div>
        ))}
      </div>
    );
  }

  if (visual.kind === "yes-no-breakdown") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-emerald-700">
            If YES resolves
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-700">Worth $1.00</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-rose-700">
            If NO resolves
          </p>
          <p className="mt-1 text-lg font-semibold text-rose-700">Worth $0.00</p>
        </div>
      </div>
    );
  }

  return null;
}

function AskThisMarket({
  activeId: controlledActiveId,
  onActiveChange,
}: {
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
} = {}) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;
  const setActiveId = (updater: string | null | ((current: string | null) => string | null)) => {
    const next = typeof updater === "function" ? updater(activeId) : updater;
    if (onActiveChange) {
      onActiveChange(next);
    } else {
      setInternalActiveId(next);
    }
  };
  const active = activeId ? askQuestions.find((q) => q.id === activeId) ?? null : null;

  return (
    <div id="ask-this-market" className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Ask this market</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Ask a question in plain language
          </h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          Pre-written demo answers
        </span>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600">
        Pick a question below. Answers are deterministic and based entirely on the fictional demo
        data already shown on this page — there is no live model or external data behind them.
      </p>

      <div className="flex flex-wrap gap-2">
        {askQuestions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setActiveId((current) => (current === q.id ? null : q.id))}
            className={`rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors ${
              activeId === q.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {q.question}
          </button>
        ))}
      </div>

      {active ? (
        <div className="fade-in-up mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
            {active.question}
          </p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            {active.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-4">
            <AskAnswerVisual question={active} />
          </div>
          <p className="mt-4 text-[11px] leading-5 text-slate-400">
            Demonstration content only. This answer is a pre-written response based on the fictional
            data in this prototype, not real economic analysis or financial advice.
          </p>
        </div>
      ) : null}
    </div>
  );
}
type AutomationRuleId = "take-profit" | "protect-position" | "smart-alert";

type AutomationRule = {
  id: AutomationRuleId;
  title: string;
  description: string;
  supporting: string;
  status: string;
};

const automationRules: AutomationRule[] = [
  {
    id: "take-profit",
    title: "Take Profit",
    description: "Sell if probability reaches 75%",
    supporting: "Lock in upside",
    status: "Take profit at 75%",
  },
  {
    id: "protect-position",
    title: "Protect Position",
    description: "Sell if probability falls below 35%",
    supporting: "Limit downside",
    status: "Protect position below 35%",
  },
  {
    id: "smart-alert",
    title: "Smart Alert",
    description: "Notify me if probability moves ±10 points",
    supporting: "Know when something meaningful changes",
    status: "Alert on ±10 point move",
  },
];

function LiveMarketsSection({ onViewIntelligence }: { onViewIntelligence: () => void }) {
  const position = getOutcome("cut-25");
  const [activeRuleId, setActiveRuleId] = useState<AutomationRuleId | null>(null);
  const activeRule = activeRuleId ? automationRules.find((rule) => rule.id === activeRuleId) ?? null : null;

  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Stay Ahead As The Market Moves</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Set your strategy once. Polymarket helps you react as probabilities change.
          </h2>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Demo Market · fictional data
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Your Position
        </p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-lg font-semibold text-slate-950">{position.label}</p>
          <p className="text-sm text-slate-600">
            Current probability: <span className="font-semibold text-blue-700">{position.probability}%</span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {automationRules.map((rule) => {
          const active = activeRuleId === rule.id;

          return (
            <button
              key={rule.id}
              type="button"
              onClick={() => setActiveRuleId((current) => (current === rule.id ? null : rule.id))}
              className={`rounded-2xl border p-3.5 text-left transition-colors ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
              }`}
            >
              <p className="text-sm font-semibold">{rule.title}</p>
              <p className={`mt-1 text-xs leading-5 ${active ? "text-slate-300" : "text-slate-500"}`}>
                &ldquo;{rule.description}&rdquo;
              </p>
              <p className={`mt-2 text-[11px] font-medium uppercase tracking-[0.1em] ${active ? "text-slate-400" : "text-blue-600"}`}>
                {rule.supporting}
              </p>
            </button>
          );
        })}
      </div>

      {activeRule ? (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Active</p>
            <p className="mt-0.5 text-sm font-medium text-emerald-800">{activeRule.status}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-slate-400">
          Select a control above to see how automation would respond as this probability changes —
          no real order is placed.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Market Moved +10 pts
          </p>
          <span className="rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            Example notification
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">57% → 67%</p>

        <div className="mt-3 space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Why</p>
            <p className="mt-0.5 text-sm leading-6 text-slate-700">
              Weaker-than-expected employment data increased expectations of a Fed cut.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Your position
            </p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-700">+16%</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewIntelligence}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
        >
          View Intelligence <span aria-hidden>→</span>
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Prototype concept only. This does not place, monitor, or execute a real trade — it
        illustrates how Polymarket could let users respond to a market automatically instead of
        checking it constantly.
      </p>
    </div>
  );
}

function OnboardingModal({
  outcome,
  onClose,
  onComplete,
}: {
  outcome: Outcome;
  onClose: () => void;
  onComplete: (amount: number) => void;
}) {
  type Step = "identity" | "amount" | "payment" | "done";
  const [step, setStep] = useState<Step>("identity");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const identityOptions = [
    { id: "apple", label: "Continue with Apple", icon: "" },
    { id: "google", label: "Continue with Google", icon: "G" },
    { id: "email", label: "Continue with Email", icon: "@" },
  ];

  const paymentOptions = [
    { id: "apple-pay", label: "Apple Pay" },
    { id: "debit", label: "Debit Card" },
    { id: "usdc", label: "USDC" },
  ];

  function chooseAmount(value: number) {
    setAmount(value);
    setShowCustomInput(false);
  }

  function confirmCustomAmount() {
    const parsed = Math.max(1, Math.round(Number.parseFloat(customAmount) || 0));
    if (parsed > 0) {
      setAmount(parsed);
      setShowCustomInput(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Start trading"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {outcome.label}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          {step === "identity" ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Get started</h3>
              <p className="mt-1 text-sm text-slate-500">
                No wallet setup required. Sign in the way you already do everywhere else.
              </p>
              <div className="mt-5 space-y-2.5">
                {identityOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStep("amount")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                      {option.icon}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-[11px] leading-4 text-slate-400">
                Demo only. No account is created and nothing is sent to Apple, Google, or email.
              </p>
            </div>
          ) : null}

          {step === "amount" ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-950">How much would you like to trade?</h3>
              <p className="mt-1 text-sm text-slate-500">
                Buying YES on &ldquo;{outcome.label}&rdquo; at {formatCents(outcome.yesPrice)}.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {[10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => chooseAmount(preset)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      amount === preset && !showCustomInput
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    showCustomInput
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Custom
                </button>
              </div>

              {showCustomInput ? (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-slate-400">
                    <span className="text-sm font-semibold text-slate-400">$</span>
                    <input
                      autoFocus
                      type="number"
                      min={1}
                      inputMode="decimal"
                      value={customAmount}
                      onChange={(event) => setCustomAmount(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") confirmCustomAmount();
                      }}
                      placeholder="Enter amount"
                      className="ml-2 w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={confirmCustomAmount}
                    className="rounded-2xl bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Set
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                disabled={amount === null}
                onClick={() => setStep("payment")}
                className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue{amount ? ` with $${amount}` : ""}
              </button>
            </div>
          ) : null}

          {step === "payment" ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-950">How would you like to pay?</h3>
              <p className="mt-1 text-sm text-slate-500">${amount} on &ldquo;{outcome.label}&rdquo;</p>
              <div className="mt-5 space-y-2.5">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStep("done")}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    {option.label}
                    <span className="text-slate-300">→</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 rounded-xl border border-violet-100 bg-violet-50 px-3.5 py-2.5 text-center text-xs font-medium text-violet-700">
                Wallet infrastructure handled automatically.
              </p>
            </div>
          ) : null}

          {step === "done" ? (
            <div className="py-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-2xl text-emerald-600">✓</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">You&rsquo;re ready to trade.</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                ${amount} is set on &ldquo;{outcome.label}&rdquo;. No wallet, keys, or gas fees required.
              </p>
              <button
                type="button"
                onClick={() => onComplete(amount ?? 0)}
                className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Done
              </button>
              <p className="mt-4 text-[11px] leading-4 text-slate-400">
                Demo only. No real account, payment, or trade was created.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TradingPanel({ outcome }: { outcome: Outcome }) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amountInput, setAmountInput] = useState("10");
  const [confirmed, setConfirmed] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  const amount = Math.max(0, Number.parseFloat(amountInput) || 0);
  const price = side === "YES" ? outcome.yesPrice : outcome.noPrice;
  const shares = price > 0 ? amount / price : 0;
  const payout = shares * 1;
  const profit = payout - amount;

  function handlePresetAmount(value: number) {
    setAmountInput(String(value));
    setConfirmed(false);
  }

  function handlePrimaryAction() {
    if (!onboarded) {
      setOnboardingOpen(true);
      return;
    }
    setConfirmed(true);
  }

  return (
    <div className="card-surface rounded-3xl p-5 lg:sticky lg:top-6 lg:p-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500">Trade this outcome</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">{outcome.label}</h2>
      </div>

      <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => {
            setSide("YES");
            setConfirmed(false);
          }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${
            side === "YES" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
        >
          Buy YES {formatCents(outcome.yesPrice)}
        </button>
        <button
          type="button"
          onClick={() => {
            setSide("NO");
            setConfirmed(false);
          }}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${
            side === "NO" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
        >
          Buy NO {formatCents(outcome.noPrice)}
        </button>
      </div>

      <div className="mt-5">
        <label htmlFor="trade-amount" className="text-sm font-medium text-slate-500">
          Amount
        </label>
        <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 focus-within:border-slate-400">
          <span className="text-lg font-semibold text-slate-400">$</span>
          <input
            id="trade-amount"
            type="number"
            min={0}
            step={1}
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => {
              setAmountInput(event.target.value);
              setConfirmed(false);
            }}
            className="ml-2 w-full bg-transparent text-lg font-semibold text-slate-950 outline-none"
            placeholder="0"
          />
        </div>

        <div className="mt-3 flex gap-2">
          {[10, 25, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetAmount(preset)}
              className="flex-1 rounded-xl border border-slate-200 bg-white/85 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-white"
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Price per share</span>
          <span className="font-semibold text-slate-950">{formatCents(price)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Shares received</span>
          <span className="font-semibold text-slate-950">{shares.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Payout if {side} is correct</span>
          <span className="font-semibold text-emerald-600">{formatMoney(payout)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Profit if {side} is correct</span>
          <span className={`font-semibold ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {profit >= 0 ? "+" : ""}
            {formatMoney(profit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Max loss if wrong</span>
          <span className="font-semibold text-rose-600">-{formatMoney(amount)}</span>
        </div>
      </div>

      {!onboarded ? (
        <button
          type="button"
          disabled={amount <= 0}
          onClick={handlePrimaryAction}
          className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trade This Market
        </button>
      ) : (
        <button
          type="button"
          disabled={amount <= 0}
          onClick={handlePrimaryAction}
          className={`mt-5 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm ${
            side === "YES" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {confirmed ? "Previewed — no real trade placed" : `Preview Buy ${side} for ${formatMoney(amount || 0)}`}
        </button>
      )}

      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        Demo only. This button does not execute a real transaction, move real money, or connect to a
        wallet.
      </p>

      {onboardingOpen ? (
        <OnboardingModal
          outcome={outcome}
          onClose={() => setOnboardingOpen(false)}
          onComplete={(chosenAmount) => {
            setOnboarded(true);
            setOnboardingOpen(false);
            if (chosenAmount > 0) {
              setAmountInput(String(chosenAmount));
            }
          }}
        />
      ) : null}
    </div>
  );
}

const presentationSteps = [
  "current",
  "intelligence",
  "why-moving",
  "chart-event",
  "signal-quality",
  "whats-next",
  "ask-70",
] as const;

type PresentationStep = (typeof presentationSteps)[number];

const presentationStepCopy: Record<PresentationStep, { label: string; hint: string }> = {
  current: { label: "Start", hint: "What the market believes right now." },
  intelligence: { label: "Add intelligence", hint: "Switch on the Intelligence Layer." },
  "why-moving": { label: "Why is this moving?", hint: "Scroll to the drivers behind the move." },
  "chart-event": { label: "Show a driver on the chart", hint: "Open the Fed Commentary event marker." },
  "signal-quality": { label: "How strong is the signal?", hint: "Scroll to Signal Quality." },
  "whats-next": { label: "What could change it next?", hint: "Scroll to upcoming catalysts." },
  "ask-70": { label: "Ask the market", hint: "Ask what it would take to reach 70%." },
};

export function FedRateMarket() {
  const [selectedId, setSelectedId] = useState<OutcomeId>(defaultOutcomeId);
  const [experience, setExperience] = useState<Experience>("current");
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationStepIndex, setPresentationStepIndex] = useState(0);
  const [chartActiveEventId, setChartActiveEventId] = useState<string | null>(null);
  const [askActiveId, setAskActiveId] = useState<string | null>(null);
  const outcome = getOutcome(selectedId);

  const history = historyFor(outcome);
  const threeDaysAgo = history.find((point) => point.label === "3 days ago");
  const today = history[history.length - 1];
  const recentChange = threeDaysAgo ? today.probability - threeDaysAgo.probability : 0;

  const scrollToId = (id: string) => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // The entire Intelligence Layer (Why Moving, Signal Quality, Catalysts, Ask
  // This Market) is authored specifically for the "Cut rates by 25 bps"
  // outcome. Switching to Intelligence Experience always re-selects that
  // outcome so the narrative never contradicts the displayed probability.
  const changeExperience = (next: Experience) => {
    setExperience(next);
    if (next === "intelligence") {
      setSelectedId("cut-25");
    }
  };

  const runPresentationStep = (step: PresentationStep) => {
    if (step === "current") {
      changeExperience("current");
    } else if (step === "intelligence") {
      changeExperience("intelligence");
    } else if (step === "why-moving") {
      changeExperience("intelligence");
      scrollToId("why-moving");
    } else if (step === "chart-event") {
      changeExperience("intelligence");
      setChartActiveEventId("fed-commentary-event");
    } else if (step === "signal-quality") {
      changeExperience("intelligence");
      setChartActiveEventId(null);
      scrollToId("signal-quality");
    } else if (step === "whats-next") {
      changeExperience("intelligence");
      scrollToId("whats-next");
    } else if (step === "ask-70") {
      changeExperience("intelligence");
      scrollToId("ask-this-market");
      setAskActiveId("reach-70");
    }
  };

  const goToPresentationStep = (index: number) => {
    const clamped = Math.max(0, Math.min(presentationSteps.length - 1, index));
    setPresentationStepIndex(clamped);
    runPresentationStep(presentationSteps[clamped]);
  };

  const togglePresentationMode = () => {
    setPresentationMode((prev) => {
      const next = !prev;
      if (next) {
        setPresentationStepIndex(0);
        runPresentationStep("current");
      } else {
        setChartActiveEventId(null);
        setAskActiveId(null);
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(41,91,255,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <div
        className={`mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 ${
          presentationMode ? "py-4 lg:py-5" : "py-6 lg:py-8"
        }`}
      >
        {presentationMode ? (
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Polymarket Intelligence · Presentation Mode
            </p>
            <button
              type="button"
              onClick={togglePresentationMode}
              className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              Exit presentation mode
            </button>
          </div>
        ) : (
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Coinbase · Roundtable Research Prototype
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.75rem]">
                Polymarket Intelligence
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                From market probability to market understanding.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2">
                <Link
                  href="/vision"
                  className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                >
                  Product Vision →
                </Link>
                <button
                  type="button"
                  onClick={togglePresentationMode}
                  className="rounded-full border border-slate-900 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Presentation mode
                </button>
              </div>
              <p className="text-xs font-medium text-slate-400 sm:text-right">
                Concept &amp; prototype by Arnab Ganguly
              </p>
            </div>
          </div>
        )}

        {!presentationMode ? (
          <div className="card-surface mb-6 flex flex-wrap items-center gap-3 rounded-2xl border-amber-200 bg-amber-50/80 px-5 py-3.5">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Demo Market
            </span>
            <p className="text-sm leading-6 text-amber-900">
              All prices, probabilities, and history on this page are fictional and generated for this
              prototype. They do not represent real Federal Reserve predictions or live market data.
            </p>
          </div>
        ) : null}

        <div className={presentationMode ? "mb-4" : "mb-6"}>
          <ExperienceToggle
            experience={experience}
            onChange={(next) => {
              changeExperience(next);
              if (presentationMode) {
                setPresentationStepIndex(next === "intelligence" ? 1 : 0);
              }
            }}
            presentationMode={presentationMode}
          />
        </div>

        <header
          className={`card-surface mb-6 rounded-[2rem] ${
            presentationMode ? "px-5 py-4 lg:px-7 lg:py-5" : "px-5 py-5 lg:px-7 lg:py-6"
          }`}
        >
          {!presentationMode ? (
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1">
                {marketMeta.category}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1">
                Resolves {marketMeta.resolution}
              </span>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700">
                {marketMeta.status}
              </span>
            </div>
          ) : null}

          <h2
            className={`max-w-3xl font-semibold tracking-tight text-slate-950 ${
              presentationMode ? "mt-1 text-3xl sm:text-4xl lg:text-[2.6rem]" : "mt-4 text-3xl sm:text-4xl"
            }`}
          >
            {marketMeta.question}
          </h2>

          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${presentationMode ? "mt-4" : "mt-5"}`}>
            {[
              { label: "Selected outcome", value: `${outcome.probability}%` },
              { label: "Trading volume", value: marketMeta.volume },
              { label: "Liquidity", value: marketMeta.liquidity },
              { label: "Active traders", value: marketMeta.traders },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{stat.value}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div
              key={experience}
              className={`card-surface rounded-[2rem] ${presentationMode ? "p-6 lg:p-8" : "p-6 lg:p-7"} ${
                experience === "intelligence" ? "hero-glow-in" : ""
              }`}
            >
              <p className="text-sm font-medium tracking-[0.22em] text-slate-500 uppercase">
                Market-implied probability
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p
                    className={`font-semibold tracking-tight text-slate-950 ${
                      presentationMode ? "text-7xl lg:text-8xl" : "text-6xl"
                    }`}
                  >
                    {outcome.probability}%
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Selected outcome: {outcome.label}</p>
                  {experience === "intelligence" ? (
                    <p
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
                        recentChange >= 0
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {recentChange >= 0 ? "↑" : "↓"} {Math.abs(recentChange)} percentage points over
                      the last 3 days
                    </p>
                  ) : null}
                  {!presentationMode ? (
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                      The market currently prices &ldquo;{outcome.label}&rdquo; at a{" "}
                      {outcome.probability}% probability. Buy YES at {formatCents(outcome.yesPrice)} or
                      NO at {formatCents(outcome.noPrice)} based on whether you agree.
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                      Buy YES
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-700">
                      {formatCents(outcome.yesPrice)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-rose-700">
                      Buy NO
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-rose-700">
                      {formatCents(outcome.noPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!presentationMode && experience === "current" ? (
              <OutcomesCard selectedId={selectedId} onSelect={setSelectedId} />
            ) : null}
            <ProbabilityHistoryChart
              outcome={outcome}
              experience={experience}
              presentationMode={presentationMode}
              activeEventId={chartActiveEventId}
              onActiveEventChange={setChartActiveEventId}
            />
            {experience === "intelligence" ? (
              <IntelligenceLayerSection askActiveId={askActiveId} onAskActiveChange={setAskActiveId} />
            ) : null}
            {!presentationMode ? (
              <LiveMarketsSection onViewIntelligence={() => changeExperience("intelligence")} />
            ) : null}
          </div>

          <TradingPanel outcome={outcome} />
        </div>
      </div>

      {presentationMode ? (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={() => goToPresentationStep(presentationStepIndex - 1)}
              disabled={presentationStepIndex === 0}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Back
            </button>
            <div className="flex items-center gap-1.5">
              {presentationSteps.map((step, index) => (
                <span
                  key={step}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    index === presentationStepIndex ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="hidden text-xs font-medium text-slate-500 sm:block">
              {presentationStepCopy[presentationSteps[presentationStepIndex]].hint}
            </p>
            <button
              type="button"
              onClick={() => goToPresentationStep(presentationStepIndex + 1)}
              disabled={presentationStepIndex === presentationSteps.length - 1}
              className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {presentationStepIndex === presentationSteps.length - 1
                ? "Done"
                : presentationStepCopy[presentationSteps[presentationStepIndex + 1]].label}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  catalysts,
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
  type Catalyst,
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

function chartGeometry(points: HistoryPoint[]) {
  const width = 720;
  const height = 220;
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

function ProbabilityHistoryChart({
  outcome,
  experience,
}: {
  outcome: Outcome;
  experience: Experience;
}) {
  const points = useMemo(() => historyFor(outcome), [outcome]);
  const { coordinates, line, area, width, height, max, min } = useMemo(
    () => chartGeometry(points),
    [points],
  );
  const first = points[0];
  const last = points[points.length - 1];
  const change = last.probability - first.probability;

  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Probability history</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
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

      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(41,91,255,0.10),rgba(255,255,255,0.85))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
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

          {coordinates.map((point) => (
            <circle
              key={point.label}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="white"
              stroke="rgba(41, 91, 255, 0.95)"
              strokeWidth="3"
            />
          ))}

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
}: {
  experience: Experience;
  onChange: (experience: Experience) => void;
}) {
  return (
    <div className="card-surface flex flex-col gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Choose how to view this market</p>
        <p className="mt-0.5 text-xs text-slate-400">
          The underlying market, prices, and history are identical in both views.
        </p>
      </div>
      <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
        {(
          [
            { id: "current" as const, label: "Current Experience" },
            { id: "intelligence" as const, label: "Intelligence Experience" },
          ]
        ).map((option) => {
          const active = option.id === experience;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                active ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-950"
              }`}
            >
              {option.label}
            </button>
          );
        })}
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
    <div className="card-surface rounded-3xl p-5 lg:p-6">
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
    <div className="card-surface rounded-3xl p-5 lg:p-6">
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
    <div className="card-surface rounded-3xl p-5 lg:p-6">
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

function IntelligenceLayerSection() {
  return (
    <div className="space-y-6">
      <WhyMovingCard />
      <SignalQualityCard />
      <CatalystTimelineCard />
    </div>
  );
}



function TradingPanel({ outcome }: { outcome: Outcome }) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amountInput, setAmountInput] = useState("10");
  const [confirmed, setConfirmed] = useState(false);

  const amount = Math.max(0, Number.parseFloat(amountInput) || 0);
  const price = side === "YES" ? outcome.yesPrice : outcome.noPrice;
  const shares = price > 0 ? amount / price : 0;
  const payout = shares * 1;
  const profit = payout - amount;

  function handlePresetAmount(value: number) {
    setAmountInput(String(value));
    setConfirmed(false);
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

      <button
        type="button"
        disabled={amount <= 0}
        onClick={() => setConfirmed(true)}
        className={`mt-5 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm ${
          side === "YES" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
        } disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {confirmed ? "Previewed — no real trade placed" : `Preview Buy ${side} for ${formatMoney(amount || 0)}`}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        Demo only. This button does not execute a real transaction, move real money, or connect to a
        wallet.
      </p>
    </div>
  );
}

export function FedRateMarket() {
  const [selectedId, setSelectedId] = useState<OutcomeId>(defaultOutcomeId);
  const [experience, setExperience] = useState<Experience>("current");
  const outcome = getOutcome(selectedId);

  const history = historyFor(outcome);
  const threeDaysAgo = history.find((point) => point.label === "3 days ago");
  const today = history[history.length - 1];
  const recentChange = threeDaysAgo ? today.probability - threeDaysAgo.probability : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(41,91,255,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
          <p className="text-xs font-medium text-slate-400 sm:pt-1 sm:text-right">
            Concept &amp; prototype by Arnab Ganguly
          </p>
        </div>

        <div className="card-surface mb-6 flex flex-wrap items-center gap-3 rounded-2xl border-amber-200 bg-amber-50/80 px-5 py-3.5">
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
            Demo Market
          </span>
          <p className="text-sm leading-6 text-amber-900">
            All prices, probabilities, and history on this page are fictional and generated for this
            prototype. They do not represent real Federal Reserve predictions or live market data.
          </p>
        </div>

        <div className="mb-6">
          <ExperienceToggle experience={experience} onChange={setExperience} />
        </div>

        <header className="card-surface mb-6 rounded-[2rem] px-5 py-5 lg:px-7 lg:py-6">
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

          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {marketMeta.question}
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <div className="card-surface rounded-[2rem] p-6 lg:p-7">
              <p className="text-sm font-medium tracking-[0.22em] text-slate-500 uppercase">
                Market-implied probability
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-6xl font-semibold tracking-tight text-slate-950">
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
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                    The market currently prices &ldquo;{outcome.label}&rdquo; at a{" "}
                    {outcome.probability}% probability. Buy YES at {formatCents(outcome.yesPrice)} or
                    NO at {formatCents(outcome.noPrice)} based on whether you agree.
                  </p>
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

            <OutcomesCard selectedId={selectedId} onSelect={setSelectedId} />
            <ProbabilityHistoryChart outcome={outcome} experience={experience} />
            {experience === "intelligence" ? <IntelligenceLayerSection /> : null}
          </div>

          <TradingPanel outcome={outcome} />
        </div>
      </div>
    </main>
  );
}

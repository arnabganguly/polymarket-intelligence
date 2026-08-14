"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultMarketId,
  getMarketById,
  markets,
  rangeOptions,
  type Driver,
  type MarketIntelligence,
  type ProbabilityPoint,
  type RangeOption,
  type SignalMetric,
} from "@/lib/mock-data";

function formatPrice(value: number) {
  return `${Math.round(value * 100)}c`;
}

function formatSignedPoints(value: number) {
  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(1)} pts`;
}

function directionStyles(direction: Driver["direction"]) {
  switch (direction) {
    case "supports-yes":
      return {
        badge: "Supports YES",
        tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
        accent: "bg-emerald-500",
      };
    case "supports-no":
      return {
        badge: "Supports NO",
        tone: "text-rose-700 bg-rose-50 border-rose-200",
        accent: "bg-rose-500",
      };
    default:
      return {
        badge: "Mixed",
        tone: "text-amber-700 bg-amber-50 border-amber-200",
        accent: "bg-amber-500",
      };
  }
}

function scoreTone(score: number) {
  if (score >= 80) {
    return "text-emerald-700";
  }

  if (score >= 65) {
    return "text-sky-700";
  }

  return "text-amber-700";
}

function chartGeometry(points: ProbabilityPoint[]) {
  const width = 760;
  const height = 260;
  const paddingX = 22;
  const paddingTop = 18;
  const paddingBottom = 36;
  const max = Math.max(...points.map((point) => point.probability)) + 5;
  const min = Math.max(0, Math.min(...points.map((point) => point.probability)) - 5);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingTop - paddingBottom;

  const coordinates = points.map((point, index) => {
    const x =
      paddingX +
      (points.length === 1 ? usableWidth / 2 : (index / (points.length - 1)) * usableWidth);
    const y =
      paddingTop + ((max - point.probability) / Math.max(max - min, 1)) * usableHeight;

    return { ...point, x, y };
  });

  const line = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${paddingX},${height - paddingBottom} ${line} ${width - paddingX},${height - paddingBottom}`;

  return { coordinates, line, area, width, height, paddingBottom, max, min };
}

function ProbabilityChart({
  market,
  range,
  onRangeChange,
}: {
  market: MarketIntelligence;
  range: RangeOption;
  onRangeChange: (range: RangeOption) => void;
}) {
  const points = market.history[range];
  const { coordinates, line, area, width, height, paddingBottom, max, min } =
    useMemo(() => chartGeometry(points), [points]);

  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Probability trend</p>
          <p className="mt-1 text-sm text-slate-600">
            Market-implied probability with volume-weighted activity annotations.
          </p>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-white/80 p-1">
          {rangeOptions.map((option) => {
            const active = option === range;

            return (
              <button
                key={option}
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
                onClick={() => onRangeChange(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(41,91,255,0.10),rgba(255,255,255,0.85))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = 18 + ratio * (height - paddingBottom - 18);

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
            <g key={`${range}-${point.label}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5.5"
                fill="white"
                stroke="rgba(41, 91, 255, 0.95)"
                strokeWidth="3"
              />
              {point.annotation ? (
                <>
                  <line
                    x1={point.x}
                    y1={point.y - 8}
                    x2={point.x}
                    y2={point.y - 34}
                    stroke="rgba(41, 91, 255, 0.35)"
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={point.x - 44}
                    y={point.y - 62}
                    width="88"
                    height="20"
                    rx="10"
                    fill="rgba(15, 23, 42, 0.88)"
                  />
                  <text
                    x={point.x}
                    y={point.y - 48}
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {point.annotation}
                  </text>
                </>
              ) : null}
            </g>
          ))}

          {coordinates.map((point) => (
            <text
              key={`label-${range}-${point.label}`}
              x={point.x}
              y={height - 12}
              fill="rgba(100, 116, 139, 0.92)"
              fontSize="11"
              textAnchor="middle"
            >
              {point.label}
            </text>
          ))}

          <text x={width - 6} y="18" fill="rgba(100, 116, 139, 0.92)" fontSize="11" textAnchor="end">
            {max}%
          </text>
          <text
            x={width - 6}
            y={height - paddingBottom + 4}
            fill="rgba(100, 116, 139, 0.92)"
            fontSize="11"
            textAnchor="end"
          >
            {min}%
          </text>
        </svg>
      </div>
    </div>
  );
}

function MarketRail({
  activeMarketId,
  onSelect,
}: {
  activeMarketId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="space-y-4">
      <div className="card-surface rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Market navigator</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Where the signal is moving</h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-500">
            Mock data
          </div>
        </div>

        <div className="space-y-3">
          {markets.map((market) => {
            const active = market.id === activeMarketId;

            return (
              <button
                key={market.id}
                type="button"
                onClick={() => onSelect(market.id)}
                className={`w-full rounded-2xl border p-4 text-left ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                    : "border-slate-200 bg-white/80 text-slate-950 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs font-medium ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {market.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5">{market.question}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{market.probability}%</p>
                    <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {market.signalLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="h-2 flex-1 rounded-full bg-slate-200/80">
                    <div
                      className={`h-2 rounded-full ${active ? "bg-white" : "bg-slate-950"}`}
                      style={{ width: `${market.signalScore}%` }}
                    />
                  </div>
                  <span
                    className={`ml-3 text-xs font-medium ${active ? "text-slate-200" : "text-slate-500"}`}
                  >
                    Signal {market.signalScore}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card-surface rounded-3xl p-5">
        <p className="text-sm font-medium text-slate-500">Why this prototype exists</p>
        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
          <p>
            Polymarket already answers <span className="font-semibold text-slate-950">what</span> the
            market believes.
          </p>
          <p>
            This layer adds <span className="font-semibold text-slate-950">why</span>,{" "}
            <span className="font-semibold text-slate-950">how strong</span>, and{" "}
            <span className="font-semibold text-slate-950">what changes next</span>.
          </p>
        </div>
      </div>
    </aside>
  );
}

function HeroCard({ market }: { market: MarketIntelligence }) {
  return (
    <div className="card-surface rounded-[2rem] p-6 lg:p-7">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1">{market.category}</span>
        <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1">{market.status}</span>
        <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1">Resolves {market.resolution}</span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_300px]">
        <div>
          <p className="text-sm font-medium tracking-[0.22em] text-slate-500 uppercase">
            Market intelligence
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {market.question}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{market.thesis}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              Buy YES {formatPrice(market.yesPrice)}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-300 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400 hover:bg-white"
            >
              Buy NO {formatPrice(market.noPrice)}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Add to watchlist
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-300">Current probability</p>
              <p className="mt-2 text-6xl font-semibold tracking-tight">{market.probability}%</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">24h</p>
              <p className={`mt-1 text-lg font-semibold ${market.dayChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatSignedPoints(market.dayChange)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/6 p-3">
              <p className="text-slate-400">7d change</p>
              <p className={`mt-1 text-lg font-semibold ${market.weekChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatSignedPoints(market.weekChange)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/6 p-3">
              <p className="text-slate-400">Signal</p>
              <p className="mt-1 text-lg font-semibold">{market.signalScore}/100</p>
            </div>
            <div className="rounded-2xl bg-white/6 p-3">
              <p className="text-slate-400">24h volume</p>
              <p className="mt-1 text-lg font-semibold">{market.volume24h}</p>
            </div>
            <div className="rounded-2xl bg-white/6 p-3">
              <p className="text-slate-400">Liquidity</p>
              <p className="mt-1 text-lg font-semibold">{market.liquidity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DriversCard({
  drivers,
  selectedDriverId,
  onSelectDriver,
}: {
  drivers: Driver[];
  selectedDriverId: string;
  onSelectDriver: (id: string) => void;
}) {
  const selectedDriver =
    drivers.find((driver) => driver.id === selectedDriverId) ?? drivers[0];
  const styles = directionStyles(selectedDriver.direction);

  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Why the market believes this</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Driver stack</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-500">
          Click a driver
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
        <div className="space-y-3">
          {drivers.map((driver) => {
            const active = driver.id === selectedDriver.id;
            const tone = directionStyles(driver.direction);

            return (
              <button
                key={driver.id}
                type="button"
                onClick={() => onSelectDriver(driver.id)}
                className={`w-full rounded-2xl border p-4 text-left ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white/85 text-slate-950 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        active
                          ? "border-white/15 bg-white/10 text-slate-100"
                          : tone.tone
                      }`}
                    >
                      {tone.badge}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-5">{driver.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{driver.impact}%</p>
                    <p className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                      weight
                    </p>
                  </div>
                </div>
                <p className={`mt-3 text-sm leading-6 ${active ? "text-slate-200" : "text-slate-600"}`}>
                  {driver.summary}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.tone}`}>
              {styles.badge}
            </span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Confidence</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-950">
                {selectedDriver.confidence}
              </span>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-slate-950">{selectedDriver.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{selectedDriver.implication}</p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500">Contribution to current price</span>
              <span className="font-semibold text-slate-950">{selectedDriver.impact}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${styles.accent}`}
                style={{ width: `${selectedDriver.impact}%` }}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500">What traders are anchoring on</p>
            <ul className="mt-3 space-y-3">
              {selectedDriver.evidence.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalStrengthCard({
  market,
  metrics,
}: {
  market: MarketIntelligence;
  metrics: SignalMetric[];
}) {
  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">How strong is the signal?</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">Signal quality</h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white lg:sticky lg:top-6">
          <div
            className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(from 180deg, #295bff 0deg, #295bff ${market.signalScore * 3.6}deg, rgba(255,255,255,0.12) ${market.signalScore * 3.6}deg, rgba(255,255,255,0.12) 360deg)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-slate-950">
              <span className="text-4xl font-semibold">{market.signalScore}</span>
              <span className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                signal
              </span>
            </div>
          </div>

          <p className={`mt-5 text-lg font-semibold ${scoreTone(market.signalScore)}`}>
            {market.signalLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{market.signalSummary}</p>
        </div>

        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{metric.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{metric.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-950">{metric.display}</p>
                  <p className={`text-sm font-medium ${scoreTone(metric.score)}`}>{metric.score}/100</p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-950"
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatalystsCard({ market }: { market: MarketIntelligence }) {
  return (
    <div className="card-surface rounded-3xl p-5 lg:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">What could change it next?</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Upcoming catalysts</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-500">
          Forward looking
        </div>
      </div>

      <div className="space-y-4">
        {market.catalysts.map((catalyst, index) => (
          <div
            key={catalyst.id}
            className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 lg:grid-cols-[108px_minmax(0,1fr)]"
          >
            <div className="relative flex flex-col items-start">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  {catalyst.horizon}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{catalyst.dateLabel}</p>
              </div>
              {index < market.catalysts.length - 1 ? (
                <div className="ml-5 mt-3 hidden h-full w-px bg-slate-200 lg:block" />
              ) : null}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-950">{catalyst.title}</h3>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {catalyst.impact}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{catalyst.summary}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {catalyst.scenarios.map((scenario) => (
                  <div key={scenario.label} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{scenario.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{scenario.probabilityEffect}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContextStrip({ market }: { market: MarketIntelligence }) {
  const stats = [
    { label: "Open interest", value: market.openInterest },
    { label: "Active traders", value: market.traders },
    { label: "YES price", value: formatPrice(market.yesPrice) },
    { label: "NO price", value: formatPrice(market.noPrice) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card-surface rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function IntelligenceLayer() {
  const [selectedMarketId, setSelectedMarketId] = useState(defaultMarketId);
  const [selectedRange, setSelectedRange] = useState<RangeOption>("1W");
  const market = getMarketById(selectedMarketId);
  const [selectedDriverId, setSelectedDriverId] = useState(market.drivers[0]?.id ?? "");

  const activeDriverId = useMemo(() => {
    const stillExists = market.drivers.some((driver) => driver.id === selectedDriverId);

    return stillExists ? selectedDriverId : market.drivers[0]?.id ?? "";
  }, [market.drivers, selectedDriverId]);

  useEffect(() => {
    if (activeDriverId !== selectedDriverId) {
      setSelectedDriverId(activeDriverId);
    }
  }, [activeDriverId, selectedDriverId]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(41,91,255,0.10),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]">
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="card-surface mb-6 rounded-[2rem] px-5 py-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                  Polymarket
                </div>
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-500">
                  Intelligence Layer prototype
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                A premium information layer on top of prediction markets: explain the price, grade the
                signal, and make the next catalyst legible for mainstream users.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Live markets", value: "4" },
                { label: "Tracked catalysts", value: "8" },
                { label: "Avg. signal quality", value: "70" },
                { label: "Mode", value: "Demo" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <MarketRail activeMarketId={selectedMarketId} onSelect={setSelectedMarketId} />

          <div className="space-y-6">
            <HeroCard market={market} />
            <ContextStrip market={market} />
            <ProbabilityChart market={market} range={selectedRange} onRangeChange={setSelectedRange} />
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
              <DriversCard
                drivers={market.drivers}
                selectedDriverId={activeDriverId}
                onSelectDriver={setSelectedDriverId}
              />
              <SignalStrengthCard market={market} metrics={market.signalMetrics} />
            </div>
            <CatalystsCard market={market} />
          </div>
        </div>
      </div>
    </main>
  );
}

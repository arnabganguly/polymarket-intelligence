// Fictional demo data for the Fed interest-rate decision market.
// All figures are illustrative only and do not reflect real Federal Reserve
// predictions, prices, or trading activity.

export type OutcomeId = "cut-50" | "cut-25" | "no-change" | "raise";

export type Outcome = {
  id: OutcomeId;
  label: string;
  probability: number;
  yesPrice: number;
  noPrice: number;
};

export type HistoryPoint = {
  label: string;
  probability: number;
};

export const marketMeta = {
  category: "Macro · Federal Reserve",
  question: "What will the Fed do at its next interest-rate meeting?",
  resolution: "Sep 17, 2026",
  status: "Demo Market",
  volume: "$8.4M",
  liquidity: "$3.1M",
  traders: "5,240",
};

export const outcomes: Outcome[] = [
  {
    id: "cut-50",
    label: "Cut rates by 50+ bps",
    probability: 8,
    yesPrice: 0.09,
    noPrice: 0.92,
  },
  {
    id: "cut-25",
    label: "Cut rates by 25 bps",
    probability: 57,
    yesPrice: 0.58,
    noPrice: 0.44,
  },
  {
    id: "no-change",
    label: "No change",
    probability: 32,
    yesPrice: 0.33,
    noPrice: 0.68,
  },
  {
    id: "raise",
    label: "Raise rates",
    probability: 3,
    yesPrice: 0.04,
    noPrice: 0.97,
  },
];

export const defaultOutcomeId: OutcomeId = "cut-25";

// Probability history for the "Cut rates by 25 bps" outcome.
export const cut25History: HistoryPoint[] = [
  { label: "2 weeks ago", probability: 39 },
  { label: "10 days ago", probability: 42 },
  { label: "7 days ago", probability: 45 },
  { label: "5 days ago", probability: 44 },
  { label: "3 days ago", probability: 49 },
  { label: "Yesterday", probability: 51 },
  { label: "Today", probability: 57 },
];

export function getOutcome(id: OutcomeId): Outcome {
  const outcome = outcomes.find((item) => item.id === id);

  if (!outcome) {
    throw new Error(`Unknown outcome: ${id}`);
  }

  return outcome;
}

// ---------------------------------------------------------------------------
// Intelligence Layer (fictional prototype content)
//
// Everything below is illustrative demo analysis used to show HOW this
// product would explain probability movements if it were connected to real
// world data feeds. None of it should be read as real economic information,
// real Fed commentary, or real market analysis.
// ---------------------------------------------------------------------------

export type DriverDirection = "positive" | "negative" | "neutral";

export type MarketDriver = {
  id: string;
  headline: string;
  dateLabel: string;
  description: string;
  direction: DriverDirection;
  impactLabel: string;
  source: string;
};

export const movingSummary =
  "The market-implied probability of a 25 bps rate cut has increased as traders react to signs of cooling economic conditions and changing expectations about Federal Reserve policy.";

export const marketDrivers: MarketDriver[] = [
  {
    id: "employment-data",
    headline: "Employment Data",
    dateLabel: "3 days ago",
    description: "Employment growth came in weaker than market expectations.",
    direction: "positive",
    impactLabel: "Impact on rate-cut expectations",
    source: "Source: Fictional labor market report (demo placeholder)",
  },
  {
    id: "inflation-data",
    headline: "Inflation Data",
    dateLabel: "2 days ago",
    description: "Recent inflation indicators showed continued moderation in price pressures.",
    direction: "positive",
    impactLabel: "Impact on rate-cut expectations",
    source: "Source: Fictional consumer price release (demo placeholder)",
  },
  {
    id: "fed-commentary",
    headline: "Federal Reserve Commentary",
    dateLabel: "Yesterday",
    description:
      "Recent Fed commentary suggested increased attention to risks from slowing economic activity.",
    direction: "positive",
    impactLabel: "Impact on rate-cut expectations",
    source: "Source: Fictional FOMC speaker remarks (demo placeholder)",
  },
];

// ---------------------------------------------------------------------------
// Signal Quality
//
// This section grades characteristics of the MARKET producing the 57%
// probability (liquidity, trading activity, spread, participation) — it does
// not grade whether the underlying prediction will turn out to be correct.
// ---------------------------------------------------------------------------

export type SignalQualityTier = "Weak" | "Moderate" | "Strong" | "Very strong";

export const signalQualityTiers: SignalQualityTier[] = ["Weak", "Moderate", "Strong", "Very strong"];

export const signalQualityRating: SignalQualityTier = "Strong";

export const signalQualityExplainer =
  "Signal Quality measures characteristics of the market producing this probability, such as liquidity, trading activity, spread and participation. It does not measure whether the prediction itself will ultimately be correct.";

export type SignalMetric = {
  id: string;
  label: string;
  value: string;
  favorability: number; // 0-100 — how healthy this dimension looks, not a prediction score
  tooltip?: string;
  note?: string;
};

export const signalMetrics: SignalMetric[] = [
  {
    id: "liquidity",
    label: "Liquidity",
    value: "High",
    favorability: 84,
    tooltip: "How easily positions can be bought or sold.",
  },
  {
    id: "volume",
    label: "Trading Volume",
    value: "$8.4M",
    favorability: 80,
    tooltip: "The total value traded on this market so far.",
  },
  {
    id: "spread",
    label: "Bid/Ask Spread",
    value: "Tight",
    favorability: 78,
    tooltip:
      "The difference between prices buyers and sellers are currently willing to accept.",
  },
  {
    id: "breadth",
    label: "Participant Breadth",
    value: "High",
    favorability: 82,
    tooltip:
      "Whether trading activity comes from many participants rather than a very small group.",
  },
  {
    id: "concentration",
    label: "Trader Concentration",
    value: "Low",
    favorability: 76,
    tooltip: "Whether a small number of participants dominate trading activity.",
    note: "Lower is healthier",
  },
];

// ---------------------------------------------------------------------------
// Upcoming catalysts
//
// Fictional, illustrative demo timeline of events that could plausibly move
// this market's probability. Dates and framing are for prototype purposes
// only and do not reflect a real economic calendar.
// ---------------------------------------------------------------------------

export type CatalystScenario = {
  label: string;
  effect: string;
};

export type Catalyst = {
  id: string;
  title: string;
  category: "Data release" | "Fed communication" | "Decision event";
  dateLabel: string;
  relativeLabel: string;
  whyItMatters: string;
  scenarios?: CatalystScenario[];
  isResolutionEvent?: boolean;
};

export const catalysts: Catalyst[] = [
  {
    id: "cpi-report",
    title: "CPI Report",
    category: "Data release",
    dateLabel: "Aug 20, 2026",
    relativeLabel: "In 6 days",
    whyItMatters:
      "New inflation data could materially change expectations about whether the Federal Reserve has room to lower rates.",
    scenarios: [
      { label: "Higher-than-expected inflation", effect: "Rate-cut probability could fall" },
      { label: "Lower-than-expected inflation", effect: "Rate-cut probability could rise" },
    ],
  },
  {
    id: "employment-report",
    title: "Employment Report",
    category: "Data release",
    dateLabel: "Sep 3, 2026",
    relativeLabel: "In 3 weeks",
    whyItMatters:
      "A materially weaker labor market could increase expectations for monetary-policy easing.",
    scenarios: [
      { label: "Weak employment", effect: "Probability could rise" },
      { label: "Strong employment", effect: "Probability could fall" },
    ],
  },
  {
    id: "fed-chair-speech",
    title: "Fed Chair Speech",
    category: "Fed communication",
    dateLabel: "Sep 10, 2026",
    relativeLabel: "In 4 weeks",
    whyItMatters:
      "Changes in language around inflation, employment, or economic risks could cause traders to revise expectations.",
  },
  {
    id: "fomc-meeting",
    title: "FOMC Meeting",
    category: "Decision event",
    dateLabel: "Sep 17, 2026",
    relativeLabel: "In 5 weeks",
    whyItMatters:
      "This is the eventual decision event associated with the market — the meeting where the Fed announces its rate decision and this market resolves.",
    isResolutionEvent: true,
  },
];

export const rangeOptions = ["1D", "1W", "1M", "All"] as const;

export type RangeOption = (typeof rangeOptions)[number];

export type Driver = {
  id: string;
  title: string;
  direction: "supports-yes" | "supports-no" | "mixed";
  impact: number;
  confidence: "High" | "Medium" | "Low";
  summary: string;
  evidence: string[];
  implication: string;
};

export type SignalMetric = {
  label: string;
  score: number;
  display: string;
  description: string;
};

export type CatalystScenario = {
  label: string;
  probabilityEffect: string;
};

export type Catalyst = {
  id: string;
  dateLabel: string;
  horizon: string;
  title: string;
  impact: "High impact" | "Medium impact" | "Low impact";
  summary: string;
  scenarios: CatalystScenario[];
};

export type ProbabilityPoint = {
  label: string;
  probability: number;
  volume: number;
  annotation?: string;
};

export type MarketIntelligence = {
  id: string;
  category: string;
  question: string;
  resolution: string;
  status: string;
  thesis: string;
  probability: number;
  yesPrice: number;
  noPrice: number;
  dayChange: number;
  weekChange: number;
  liquidity: string;
  volume24h: string;
  openInterest: string;
  traders: string;
  signalScore: number;
  signalLabel: string;
  signalSummary: string;
  signalMetrics: SignalMetric[];
  drivers: Driver[];
  catalysts: Catalyst[];
  history: Record<RangeOption, ProbabilityPoint[]>;
};

export const markets: MarketIntelligence[] = [
  {
    id: "venezuela-israel",
    category: "Geopolitics",
    question: "Will Venezuela recognize Israel by December 31?",
    resolution: "Dec 31, 2026",
    status: "Active market",
    thesis:
      "The market sees recognition as possible but still unlikely because diplomatic incentives have improved faster than domestic political constraints.",
    probability: 14,
    yesPrice: 0.15,
    noPrice: 0.87,
    dayChange: 2.1,
    weekChange: 4.8,
    liquidity: "$2.8M",
    volume24h: "$418K",
    openInterest: "$1.9M",
    traders: "3,420",
    signalScore: 72,
    signalLabel: "Moderately strong",
    signalSummary:
      "Price discovery looks credible: liquidity is healthy, the order book is tight, and recent moves have come with broad participation rather than a single burst of speculative volume.",
    signalMetrics: [
      {
        label: "Liquidity depth",
        score: 79,
        display: "$2.8M available within 3c",
        description: "The book can absorb moderate size without materially moving price.",
      },
      {
        label: "Participation breadth",
        score: 74,
        display: "3.4K active traders",
        description: "The view is supported by many accounts instead of a narrow set of holders.",
      },
      {
        label: "Price stability",
        score: 68,
        display: "Tight spread after news",
        description: "The market repriced quickly, then consolidated instead of snapping back.",
      },
      {
        label: "Flow concentration",
        score: 63,
        display: "Top 10 wallets = 27%",
        description: "Some concentration remains, but not enough to dismiss the signal.",
      },
    ],
    drivers: [
      {
        id: "regional-backchannel",
        title: "Quiet regional backchannel activity has increased",
        direction: "supports-yes",
        impact: 31,
        confidence: "High",
        summary:
          "Diplomatic reporting suggests more informal contact through third-party governments than the market had priced a month ago.",
        evidence: [
          "Two regional summits produced side-meeting speculation that traders treated as credible.",
          "The probability rose on sustained volume rather than a single headline spike.",
          "Order flow stayed net-YES even after the initial repricing.",
        ],
        implication:
          "This is the main reason the market moved off its earlier sub-10% base case.",
      },
      {
        id: "domestic-costs",
        title: "Domestic political cost still makes a full recognition move difficult",
        direction: "supports-no",
        impact: 28,
        confidence: "High",
        summary:
          "Even if the diplomatic temperature improves, leadership still faces meaningful internal downside from a formal recognition decision.",
        evidence: [
          "Recent rhetoric remains deliberately ambiguous rather than overtly preparatory.",
          "No visible legislative or executive sequencing has started yet.",
          "Large NO buyers continue to defend prices above the low teens.",
        ],
        implication:
          "The market still views non-recognition as the base case without a clearer political trigger.",
      },
      {
        id: "oil-sanctions",
        title: "Energy and sanctions negotiations create an indirect incentive",
        direction: "supports-yes",
        impact: 22,
        confidence: "Medium",
        summary:
          "Recognition is not the main issue in negotiations, but traders think it could become part of a broader normalization package.",
        evidence: [
          "Probability tends to move alongside sanctions and energy-policy headlines.",
          "Cross-market traders are pairing this with other LatAm diplomacy contracts.",
          "The effect is meaningful, but still scenario-dependent.",
        ],
        implication:
          "This creates upside optionality, but not enough to make the event likely today.",
      },
      {
        id: "timing-risk",
        title: "The calendar is short for a complex diplomatic process",
        direction: "supports-no",
        impact: 19,
        confidence: "Medium",
        summary:
          "Even if intent improves, recognition requires enough sequencing that delays can quickly kill the path before year-end.",
        evidence: [
          "Prior diplomatic shifts in the region took multiple formal steps.",
          "No public timeline has been telegraphed.",
          "Late-year deadlines reduce room for incremental progress.",
        ],
        implication:
          "This keeps the market from pricing a higher probability despite better sentiment.",
      },
    ],
    catalysts: [
      {
        id: "unga-meeting",
        dateLabel: "Sep 18",
        horizon: "Next 35 days",
        title: "UN General Assembly bilateral meetings",
        impact: "High impact",
        summary:
          "Traders expect any confirmed high-level meeting or unusually warm joint language to move the market immediately.",
        scenarios: [
          { label: "Confirmed direct meeting", probabilityEffect: "+5 to +9 pts" },
          { label: "No meeting / routine language only", probabilityEffect: "-1 to -3 pts" },
        ],
      },
      {
        id: "sanctions-review",
        dateLabel: "Oct 04",
        horizon: "6-8 weeks",
        title: "US sanctions review window",
        impact: "Medium impact",
        summary:
          "A cooperative outcome would strengthen the broader normalization narrative tied to YES buyers.",
        scenarios: [
          { label: "Constructive renewal", probabilityEffect: "+2 to +4 pts" },
          { label: "Breakdown in talks", probabilityEffect: "-3 to -6 pts" },
        ],
      },
      {
        id: "cabinet-signal",
        dateLabel: "Watch item",
        horizon: "Any time",
        title: "Cabinet-level rhetoric shift",
        impact: "High impact",
        summary:
          "This market is highly sensitive to changes from ambiguity toward explicit diplomatic preparation.",
        scenarios: [
          { label: "Explicit preparation signal", probabilityEffect: "+8 to +12 pts" },
          { label: "Hardline rebuttal", probabilityEffect: "-5 to -8 pts" },
        ],
      },
    ],
    history: {
      "1D": [
        { label: "09:30", probability: 11, volume: 18 },
        { label: "11:00", probability: 12, volume: 26 },
        { label: "12:30", probability: 12, volume: 31 },
        { label: "14:00", probability: 13, volume: 44, annotation: "regional desk note" },
        { label: "15:30", probability: 14, volume: 36 },
        { label: "17:00", probability: 14, volume: 29 },
      ],
      "1W": [
        { label: "Mon", probability: 9, volume: 62 },
        { label: "Tue", probability: 10, volume: 58 },
        { label: "Wed", probability: 11, volume: 73 },
        { label: "Thu", probability: 12, volume: 84 },
        { label: "Fri", probability: 12, volume: 68 },
        { label: "Sat", probability: 13, volume: 41 },
        { label: "Sun", probability: 14, volume: 37 },
      ],
      "1M": [
        { label: "W1", probability: 18, volume: 210 },
        { label: "W2", probability: 16, volume: 184 },
        { label: "W3", probability: 12, volume: 252, annotation: "political pushback" },
        { label: "W4", probability: 11, volume: 163 },
        { label: "W5", probability: 14, volume: 298, annotation: "backchannel chatter" },
      ],
      All: [
        { label: "Jan", probability: 34, volume: 410 },
        { label: "Feb", probability: 29, volume: 368 },
        { label: "Mar", probability: 24, volume: 302 },
        { label: "Apr", probability: 19, volume: 266 },
        { label: "May", probability: 13, volume: 224 },
        { label: "Jun", probability: 10, volume: 196 },
        { label: "Jul", probability: 11, volume: 208 },
        { label: "Aug", probability: 14, volume: 298 },
      ],
    },
  },
  {
    id: "fed-cut-september",
    category: "Macro",
    question: "Will the Fed cut rates by the September meeting?",
    resolution: "Sep 18, 2026",
    status: "Active market",
    thesis:
      "A cut is slightly favored, but the market is waiting for one more labor print before conviction meaningfully increases.",
    probability: 61,
    yesPrice: 0.62,
    noPrice: 0.40,
    dayChange: -1.4,
    weekChange: 3.2,
    liquidity: "$5.6M",
    volume24h: "$1.1M",
    openInterest: "$4.4M",
    traders: "6,980",
    signalScore: 84,
    signalLabel: "Strong",
    signalSummary:
      "This is a deep, institutionally watched market with heavy cross-checking against rates, CPI, and labor contracts.",
    signalMetrics: [
      {
        label: "Liquidity depth",
        score: 91,
        display: "$5.6M within 2c",
        description: "Large traders can enter without distorting the contract materially.",
      },
      {
        label: "Participation breadth",
        score: 87,
        display: "7K active traders",
        description: "Broad participation supports reliable price discovery.",
      },
      {
        label: "Price stability",
        score: 81,
        display: "Low intraday whipsaw",
        description: "Moves tend to track macro releases rather than rumor alone.",
      },
      {
        label: "Flow concentration",
        score: 76,
        display: "Top 10 wallets = 19%",
        description: "Signal is not dominated by a narrow wallet cluster.",
      },
    ],
    drivers: [
      {
        id: "softening-labor",
        title: "Labor data is cooling without fully breaking",
        direction: "supports-yes",
        impact: 33,
        confidence: "High",
        summary: "Enough softness to justify easing, but not yet enough for urgency.",
        evidence: ["Payroll revisions have trended lower.", "Claims drift higher in a controlled way."],
        implication: "This is the core YES case right now.",
      },
      {
        id: "services-inflation",
        title: "Sticky services inflation limits confidence",
        direction: "supports-no",
        impact: 26,
        confidence: "Medium",
        summary: "Inflation is improving, but not uniformly enough for a clean policy pivot.",
        evidence: ["Core services components remain elevated.", "Fed speakers keep optionality."],
        implication: "The market is reluctant to move much above the low 60s.",
      },
    ],
    catalysts: [
      {
        id: "jobs-report",
        dateLabel: "Sep 06",
        horizon: "Next 3 weeks",
        title: "US jobs report",
        impact: "High impact",
        summary: "This print likely decides whether the market moves toward 70% or back toward a coin flip.",
        scenarios: [
          { label: "Clear cooling", probabilityEffect: "+6 to +10 pts" },
          { label: "Hot surprise", probabilityEffect: "-8 to -12 pts" },
        ],
      },
    ],
    history: {
      "1D": [
        { label: "09:30", probability: 63, volume: 84 },
        { label: "11:00", probability: 62, volume: 70 },
        { label: "12:30", probability: 62, volume: 92 },
        { label: "14:00", probability: 61, volume: 76 },
        { label: "15:30", probability: 61, volume: 64 },
        { label: "17:00", probability: 61, volume: 58 },
      ],
      "1W": [
        { label: "Mon", probability: 58, volume: 204 },
        { label: "Tue", probability: 59, volume: 228 },
        { label: "Wed", probability: 60, volume: 242 },
        { label: "Thu", probability: 61, volume: 219 },
        { label: "Fri", probability: 61, volume: 208 },
        { label: "Sat", probability: 61, volume: 144 },
        { label: "Sun", probability: 61, volume: 120 },
      ],
      "1M": [
        { label: "W1", probability: 49, volume: 610 },
        { label: "W2", probability: 53, volume: 700 },
        { label: "W3", probability: 57, volume: 820 },
        { label: "W4", probability: 60, volume: 890 },
        { label: "W5", probability: 61, volume: 760 },
      ],
      All: [
        { label: "Jan", probability: 22, volume: 1200 },
        { label: "Feb", probability: 27, volume: 1120 },
        { label: "Mar", probability: 34, volume: 1420 },
        { label: "Apr", probability: 39, volume: 1580 },
        { label: "May", probability: 46, volume: 1710 },
        { label: "Jun", probability: 54, volume: 1890 },
        { label: "Jul", probability: 58, volume: 1750 },
        { label: "Aug", probability: 61, volume: 1640 },
      ],
    },
  },
  {
    id: "tiktok-ban",
    category: "Policy",
    question: "Will TikTok be banned in the US before year-end?",
    resolution: "Dec 31, 2026",
    status: "Active market",
    thesis:
      "The market sees legal friction slowing a full ban, but the headline risk remains high enough to keep the probability elevated.",
    probability: 38,
    yesPrice: 0.39,
    noPrice: 0.63,
    dayChange: 1.2,
    weekChange: -3.6,
    liquidity: "$3.3M",
    volume24h: "$502K",
    openInterest: "$2.5M",
    traders: "4,180",
    signalScore: 66,
    signalLabel: "Useful, but noisy",
    signalSummary:
      "This market reacts quickly to court headlines, but price can overshoot before settling.",
    signalMetrics: [
      {
        label: "Liquidity depth",
        score: 71,
        display: "$3.3M within 4c",
        description: "Healthy for a policy market, though not immune to headline gaps.",
      },
      {
        label: "Participation breadth",
        score: 67,
        display: "4.2K active traders",
        description: "A credible crowd, but more retail-heavy than macro contracts.",
      },
      {
        label: "Price stability",
        score: 58,
        display: "High intraday volatility",
        description: "Single headlines can temporarily overwhelm the signal.",
      },
      {
        label: "Flow concentration",
        score: 69,
        display: "Top 10 wallets = 24%",
        description: "Concentration is manageable, but still worth monitoring.",
      },
    ],
    drivers: [
      {
        id: "court-friction",
        title: "Court review is slowing the direct path to a ban",
        direction: "supports-no",
        impact: 34,
        confidence: "High",
        summary: "Procedural delay is the primary reason YES has retraced from prior highs.",
        evidence: ["Traders sold into each adverse legal development.", "The market now prices more delay risk than execution risk."],
        implication: "Without a legal breakthrough, the probability likely stays below 50%.",
      },
      {
        id: "election-pressure",
        title: "Election-season rhetoric keeps policy pressure alive",
        direction: "supports-yes",
        impact: 24,
        confidence: "Medium",
        summary: "Campaign messaging raises the odds of a sharp repricing on new action.",
        evidence: ["Headline sensitivity remains unusually high.", "Options traders are buying event convexity."],
        implication: "The market remains vulnerable to upside shocks.",
      },
    ],
    catalysts: [
      {
        id: "appeals-ruling",
        dateLabel: "Sep 27",
        horizon: "Next 6 weeks",
        title: "Appeals court action",
        impact: "High impact",
        summary: "A ruling that accelerates enforcement would likely be the biggest single driver.",
        scenarios: [
          { label: "Government favorable", probabilityEffect: "+9 to +15 pts" },
          { label: "Delay / adverse ruling", probabilityEffect: "-6 to -10 pts" },
        ],
      },
    ],
    history: {
      "1D": [
        { label: "09:30", probability: 36, volume: 52 },
        { label: "11:00", probability: 37, volume: 74 },
        { label: "12:30", probability: 38, volume: 81 },
        { label: "14:00", probability: 39, volume: 66 },
        { label: "15:30", probability: 38, volume: 59 },
        { label: "17:00", probability: 38, volume: 50 },
      ],
      "1W": [
        { label: "Mon", probability: 41, volume: 201 },
        { label: "Tue", probability: 40, volume: 196 },
        { label: "Wed", probability: 39, volume: 184 },
        { label: "Thu", probability: 38, volume: 230 },
        { label: "Fri", probability: 38, volume: 214 },
        { label: "Sat", probability: 38, volume: 122 },
        { label: "Sun", probability: 38, volume: 116 },
      ],
      "1M": [
        { label: "W1", probability: 44, volume: 580 },
        { label: "W2", probability: 47, volume: 720 },
        { label: "W3", probability: 43, volume: 690 },
        { label: "W4", probability: 40, volume: 642 },
        { label: "W5", probability: 38, volume: 611 },
      ],
      All: [
        { label: "Jan", probability: 18, volume: 930 },
        { label: "Feb", probability: 21, volume: 840 },
        { label: "Mar", probability: 28, volume: 980 },
        { label: "Apr", probability: 36, volume: 1120 },
        { label: "May", probability: 49, volume: 1310 },
        { label: "Jun", probability: 45, volume: 1220 },
        { label: "Jul", probability: 41, volume: 1160 },
        { label: "Aug", probability: 38, volume: 1040 },
      ],
    },
  },
  {
    id: "openai-gpt6",
    category: "Tech",
    question: "Will OpenAI release GPT-6 before December 31?",
    resolution: "Dec 31, 2026",
    status: "Active market",
    thesis:
      "The market assigns a real chance of launch, but technical and positioning uncertainty still make a near-term release less than even.",
    probability: 44,
    yesPrice: 0.45,
    noPrice: 0.57,
    dayChange: 0.8,
    weekChange: 5.7,
    liquidity: "$1.7M",
    volume24h: "$239K",
    openInterest: "$1.1M",
    traders: "2,260",
    signalScore: 59,
    signalLabel: "Moderate",
    signalSummary:
      "This market is directionally helpful, but information asymmetry is higher than in policy or macro markets.",
    signalMetrics: [
      {
        label: "Liquidity depth",
        score: 61,
        display: "$1.7M within 5c",
        description: "Tradable, though notable size can still move price.",
      },
      {
        label: "Participation breadth",
        score: 57,
        display: "2.3K active traders",
        description: "Enough activity to matter, but the pool is narrower.",
      },
      {
        label: "Price stability",
        score: 55,
        display: "Rumor-sensitive",
        description: "Signals can be diluted by speculative social chatter.",
      },
      {
        label: "Flow concentration",
        score: 63,
        display: "Top 10 wallets = 23%",
        description: "Concentration is acceptable for a tech-release market.",
      },
    ],
    drivers: [
      {
        id: "enterprise-pressure",
        title: "Enterprise demand creates a launch incentive",
        direction: "supports-yes",
        impact: 26,
        confidence: "Medium",
        summary: "The market believes there is commercial pressure to ship a new flagship model.",
        evidence: ["Probability trends up around partner leaks.", "YES flow clusters around ecosystem events."],
        implication: "Commercial incentives keep the market above 40%.",
      },
      {
        id: "positioning-risk",
        title: "Positioning and safety timing can still delay release",
        direction: "supports-no",
        impact: 29,
        confidence: "Medium",
        summary: "A strong model does not guarantee a productized public launch this year.",
        evidence: ["Naming and packaging uncertainty stays high.", "Prior launches shifted timelines late in cycle."],
        implication: "This is why the market still leans below even odds.",
      },
    ],
    catalysts: [
      {
        id: "devday",
        dateLabel: "Nov 12",
        horizon: "Next 3 months",
        title: "Flagship developer event",
        impact: "High impact",
        summary: "The market sees this as the cleanest public launch window.",
        scenarios: [
          { label: "Teaser or launch signal", probabilityEffect: "+10 to +18 pts" },
          { label: "No flagship mention", probabilityEffect: "-6 to -10 pts" },
        ],
      },
    ],
    history: {
      "1D": [
        { label: "09:30", probability: 42, volume: 31 },
        { label: "11:00", probability: 43, volume: 38 },
        { label: "12:30", probability: 43, volume: 35 },
        { label: "14:00", probability: 44, volume: 41 },
        { label: "15:30", probability: 44, volume: 33 },
        { label: "17:00", probability: 44, volume: 29 },
      ],
      "1W": [
        { label: "Mon", probability: 39, volume: 108 },
        { label: "Tue", probability: 40, volume: 101 },
        { label: "Wed", probability: 41, volume: 122 },
        { label: "Thu", probability: 43, volume: 129 },
        { label: "Fri", probability: 44, volume: 118 },
        { label: "Sat", probability: 44, volume: 83 },
        { label: "Sun", probability: 44, volume: 79 },
      ],
      "1M": [
        { label: "W1", probability: 31, volume: 244 },
        { label: "W2", probability: 34, volume: 251 },
        { label: "W3", probability: 38, volume: 301 },
        { label: "W4", probability: 42, volume: 338 },
        { label: "W5", probability: 44, volume: 347 },
      ],
      All: [
        { label: "Jan", probability: 12, volume: 310 },
        { label: "Feb", probability: 16, volume: 336 },
        { label: "Mar", probability: 19, volume: 354 },
        { label: "Apr", probability: 24, volume: 382 },
        { label: "May", probability: 29, volume: 410 },
        { label: "Jun", probability: 34, volume: 470 },
        { label: "Jul", probability: 39, volume: 510 },
        { label: "Aug", probability: 44, volume: 560 },
      ],
    },
  },
];

export const defaultMarketId = "venezuela-israel";

export function getMarketById(id: string) {
  return markets.find((market) => market.id === id) ?? markets[0];
}

// Single source of truth for the four Polymarket+ strategic pillars so the
// same very-light wash colors and accents are used everywhere in the app.
export type PillarId = "understand" | "trust" | "participate" | "return" | "distribute";

export type PillarStyle = {
  id: PillarId;
  label: string;
  /** Feature title shown next to the pillar label, e.g. "UNDERSTAND / Market Intelligence". */
  featureTitle: string;
  /** Very light background wash hex, for reference / non-Tailwind usage. */
  hex: string;
  wash: string;
  border: string;
  text: string;
  dot: string;
};

export const PILLARS: Record<PillarId, PillarStyle> = {
  understand: {
    id: "understand",
    label: "Understand",
    featureTitle: "Market Intelligence",
    hex: "#F5F2FF",
    wash: "bg-[#F5F2FF]",
    border: "border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  trust: {
    id: "trust",
    label: "Trust",
    featureTitle: "Signal Quality Score",
    hex: "#FFF8EC",
    wash: "bg-[#FFF8EC]",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  participate: {
    id: "participate",
    label: "Participate",
    featureTitle: "One-Click Access",
    hex: "#F1F7FF",
    wash: "bg-[#F1F7FF]",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  return: {
    id: "return",
    label: "Return",
    featureTitle: "Stay Ahead As The Market Moves",
    hex: "#F0FBF8",
    wash: "bg-[#F0FBF8]",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  distribute: {
    id: "distribute",
    label: "Distribute",
    featureTitle: "Intelligence Everywhere",
    hex: "#F5F6FA",
    wash: "bg-[#F5F6FA]",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
};

export const PILLAR_ORDER: PillarId[] = ["understand", "trust", "participate", "return", "distribute"];

import type { Metadata } from "next";
import { VisionPage } from "@/components/vision-page";

export const metadata: Metadata = {
  title: "Vision — Polymarket Intelligence",
  description:
    "The product strategy behind Polymarket Intelligence: from prediction market to prediction intelligence.",
};

export default function Page() {
  return <VisionPage />;
}

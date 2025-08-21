import { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "PROMPTFORGE™ — Coming Soon | Build Prompt Systems, Not Throwaway Lines",
  description: "PROMPTFORGE™ v3.0 is coming. Join the waitlist for the operational prompt generator with 50 modules, 7D engine, and .md/.json/.pdf export in under 60s.",
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}

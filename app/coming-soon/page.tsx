import { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "PROMPTFORGE™ — Coming Soon | Generator Operațional de Prompturi",
  description: "PROMPTFORGE™ se pregătește de lansare. 50 module, motor 7D, export .md/.json/.pdf în sub 60s. Înscrie-te pe lista de așteptare.",
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}

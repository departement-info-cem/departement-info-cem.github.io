import type { Metadata } from "next";
import { CentreAide } from "@/components/centre-aide";

export const metadata: Metadata = { title: "Centre d'aide" };

export default function PageCentreAide() {
  return <CentreAide />;
}

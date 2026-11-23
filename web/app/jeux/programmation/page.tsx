import type { Metadata } from "next";
import Link from "next/link";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { JeuRobot } from "@/components/jeux/jeu-robot";

export const metadata: Metadata = { title: "Octet, le robot" };

export default function Page() {
  return (
    <>
      <TitrePage titre="Octet, le robot" sousTitre="Écris le programme qui guide Octet dans le centre de données." />
      <Conteneur>
        <JeuRobot />
        <p className="mt-8 text-sm text-muted-foreground">
          Ça t&apos;a plu ? Regarde <Link href="/programmes/dec-prog" className="text-primary underline">le DEC en développement d&apos;applications</Link> ou essaie <Link href="/jeux" className="text-primary underline">l&apos;autre jeu</Link>.
        </p>
      </Conteneur>
    </>
  );
}

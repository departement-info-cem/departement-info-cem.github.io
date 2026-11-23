import type { Metadata } from "next";
import Link from "next/link";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { JeuReseau } from "@/components/jeux/jeu-reseau";

export const metadata: Metadata = { title: "Panne à la salle réseau" };

export default function Page() {
  return (
    <>
      <TitrePage titre="Panne à la salle réseau" sousTitre="Le ping ne passe pas. À toi de trouver pourquoi." />
      <Conteneur>
        <JeuReseau />
        <p className="mt-8 text-sm text-muted-foreground">
          Ça t&apos;a plu ? Regarde <Link href="/programmes/dec-reseau" className="text-primary underline">le DEC en réseaux et cybersécurité</Link> ou essaie <Link href="/jeux" className="text-primary underline">l&apos;autre jeu</Link>.
        </p>
      </Conteneur>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { BotOrientation } from "@/components/bot-orientation";
import { CartesJeux } from "@/components/jeux/cartes-jeux";
import { bot } from "@/lib/donnees";

export const metadata: Metadata = { title: "L'informatique, est-ce pour moi ?" };

export default function PageOrientation() {
  return (
    <>
      <TitrePage titre="L'informatique, est-ce pour moi ?" sousTitre="Deux petits jeux pour goûter à la programmation et aux réseaux, et un bot qui te dira quel programme te ressemble." />
      <Conteneur className="pb-0">
        <h2 className="mb-3 text-2xl font-bold">Teste ta logique en jouant</h2>
        <CartesJeux />
        <h2 className="mt-10 text-2xl font-bold">Ou réponds aux questions du bot</h2>
      </Conteneur>
      <Conteneur className="grid gap-8 pt-4 lg:grid-cols-[1fr_300px]">
        <BotOrientation bot={bot()} />
        <aside className="space-y-4 text-sm">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-2 font-bold">Tu veux en savoir plus ?</h2>
            <ul className="space-y-1">
              <li><Link href="/programmes" className="text-primary underline">Voir toutes les grilles de cours</Link></li>
              <li><Link href="/programmes/comparer/?a=dec-prog&b=dec-reseau" className="text-primary underline">Comparer les deux profils du DEC</Link></li>
              <li><Link href="/faq/?categorie=IA" className="text-primary underline">Questions sur l&apos;intelligence artificielle</Link></li>
              <li><Link href="/faq" className="text-primary underline">Foire aux questions</Link></li>
            </ul>
          </div>
          <p className="text-muted-foreground">Astuce : tu peux répondre avec les touches 1, 2, 3... de ton clavier.</p>
        </aside>
      </Conteneur>
    </>
  );
}

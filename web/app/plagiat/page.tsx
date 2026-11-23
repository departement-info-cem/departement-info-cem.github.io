import type { Metadata } from "next";
import Link from "next/link";
import { Bot, CheckCircle2, Lock, ShieldAlert, XCircle } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { bouton } from "@/lib/bouton";

export const metadata: Metadata = { title: "Plagiat et IA" };

export default function PagePlagiat() {
  return (
    <>
      <TitrePage titre="Plagiat et IA" sousTitre="La différence entre s'aider et tricher, expliquée clairement.">
        <a
          href="https://www.cegepmontpetit.ca/static/uploaded/Files/Cegep/A%20propos/Reglements%20et%20politiques/Etude%20et%20etudiants/politiques/PIEA_2015-09-21.pdf"
          target="_blank"
          rel="noreferrer"
          className={bouton({ variant: "outline" }, "mt-4")}
        >
          Politique du collège (PIEA)
        </a>
      </TitrePage>
      <Conteneur className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-primary/40 bg-accent p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <CheckCircle2 className="text-primary" /> Tu as le droit de
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>travailler avec un autre étudiant, mais chacun sur son travail ;</li>
            <li>te faire expliquer des notions vues en cours par un autre étudiant ;</li>
            <li>parler et expliquer un point à un autre étudiant.</li>
          </ul>
        </section>
        <section className="rounded-lg border border-cem-rouge/40 bg-cem-rouge/10 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <XCircle className="text-cem-rouge" /> Tu ne peux PAS
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>faire le travail d&apos;un autre étudiant à sa place ;</li>
            <li>copier le travail d&apos;un autre étudiant ;</li>
            <li>échanger des fichiers ou des parties de fichiers d&apos;un travail évalué individuellement ;</li>
            <li>prêter ou te faire prêter ta clé USB ou ton disque externe ;</li>
            <li>recopier lettre par lettre le travail d&apos;un autre.</li>
          </ul>
        </section>
        {/* Section IA : texte à valider par le département */}
        <section className="rounded-lg border bg-card p-5 md:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <Bot className="text-cem-ciel" /> Et l&apos;intelligence artificielle ?
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Ce qui est permis avec ChatGPT, Copilot ou une autre IA dépend du cours et du travail : c&apos;est indiqué dans le plan de cours et l&apos;énoncé.</li>
            <li>Dans le doute, demande à ton prof <strong>avant</strong> de remettre ton travail.</li>
            <li>Remettre comme étant le tien un travail produit par une IA, quand ce n&apos;est pas permis, est traité comme du plagiat.</li>
            <li>Même quand c&apos;est permis, tu dois être capable d&apos;expliquer chaque ligne de ce que tu remets.</li>
          </ul>
          <Link href="/faq/?categorie=IA" className="mt-3 inline-block text-sm font-semibold text-primary underline">
            Questions fréquentes sur l&apos;IA
          </Link>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <ShieldAlert className="text-cem-orange" /> Sanctions
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Celui qui a partagé son travail est sanctionné au même titre que celui qui l&apos;a copié.</li>
            <li>
              Un premier plagiat est sanctionné d&apos;un <strong>0 au travail</strong>. Si tu as déjà eu un plagiat au collège, tu auras une rencontre avec la direction.
            </li>
            <li>
              Un second plagiat dans un même cours entraîne la note de <strong>0 au cours</strong>.
            </li>
          </ul>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <Lock className="text-cem-marine dark:text-cem-ciel" /> Protège ton travail
          </h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Si tu partages ton travail ou le laisses traîner, tu ne contrôles pas ce que les autres en feront.</li>
            <li>Redémarre ton poste en quittant ; verrouille ta session si tu t&apos;absentes.</li>
            <li>Garde ta clé ou ton disque avec toi, et chiffre-le en cas de perte.</li>
            <li>Garde tes dépôts GitHub privés.</li>
            <li>Pour un travail d&apos;équipe, échange par MIO : il restera une trace du partage.</li>
          </ul>
        </section>
      </Conteneur>
    </>
  );
}

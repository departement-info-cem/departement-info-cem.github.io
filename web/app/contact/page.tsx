import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Clock, FileClock, HeartHandshake, Mail, MessageSquareWarning, Scale } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { Bloc } from "@/components/bloc";
import { bouton } from "@/lib/bouton";

export const metadata: Metadata = { title: "Nous joindre" };

// « Un problème ? » : à qui s'adresser selon la situation (repris de l'ancien problèmes.md du dépôt).
export default function PageContact() {
  return (
    <>
      <TitrePage titre="Nous joindre" sousTitre="Une seule adresse pour toutes tes questions sur les programmes du département." />
      <Conteneur className="space-y-10">
        <div className="space-y-6">
          <a href="mailto:coordination.info@cegepmontpetit.ca" className={bouton({ size: "lg" }, "h-auto max-w-full whitespace-normal py-3 text-base")}>
            {/* Sur un écran étroit, l'adresse passe à la ligne après le @ */}
            <Mail className="size-5" /> <span>coordination.info@<wbr />cegepmontpetit.ca</span>
          </a>
          <p className="max-w-2xl text-muted-foreground">
            Tu cherches un prof en particulier ? Chaque prof a sa page avec son bureau et ses disponibilités ; pour lui écrire, elle t&apos;indique s&apos;il préfère Teams ou MIO : <Link href="/profs" className="text-primary underline">voir les profs</Link>.
          </p>
        </div>

        <section id="probleme" className="scroll-mt-24 space-y-6">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-3xl font-bold">Un problème ?</h2>
            <p className="text-muted-foreground">
              À qui t&apos;adresser selon la situation. La coordination du département est au bureau E-210 ; tu peux aussi lui écrire sur Teams ou à l&apos;adresse ci-dessus.
            </p>
            <p className="text-muted-foreground">
              Pour une situation délicate, rencontre la personne (prof ou coordination) à son bureau et explique-la de vive voix. Si c&apos;est approprié, tu peux aussi écrire sur Teams.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Bloc niveau="h3" icone={HeartHandshake} titre="Un problème personnel">
              <p>Santé physique ou mentale, argent, la vie : si ce n&apos;est pas facile d&apos;en parler, approche le prof ou l&apos;employé du cégep avec qui tu es le plus à l&apos;aise.</p>
              <p>Fatigué de répéter ta situation ? Adresse-toi aux profs PAIRE : avec ton accord, ils la transmettront à toutes les personnes qui peuvent t&apos;aider.</p>
              <p className="font-semibold">En bref : les profs PAIRE, ou une personne avec qui tu es à l&apos;aise.</p>
            </Bloc>
            <Bloc niveau="h3" icone={MessageSquareWarning} titre="Un problème avec un prof">
              <p>Essaie d&apos;abord d&apos;en parler avec le prof. Si ça ne règle rien, ou si tu ne veux pas lui en parler, adresse-toi à la coordination.</p>
              <p>Si le problème est avec la coordination, ou si tu n&apos;es pas à l&apos;aise, parles-en à un prof de ton choix ou à la direction des études.</p>
              <p>Dans tous les cas, ce que tu dis n&apos;est pas répété au prof, sauf si tu es d&apos;accord, pour régler la situation.</p>
              <p className="font-semibold">En bref : le prof, la coordination, puis la direction.</p>
            </Bloc>
            <Bloc niveau="h3" icone={Clock} titre="Un prof absent ou en retard">
              <p>Si ça se répète et que ce n&apos;est affiché ni sur Omnivox ni sur les écrans du cégep, préviens la coordination : passe à son bureau ou écris-lui sur Teams.</p>
            </Bloc>
            <Bloc niveau="h3" icone={FileClock} titre="Une correction en retard">
              <p>Le prof doit te remettre ta copie, avec ses commentaires, dans les 3 semaines qui suivent la remise du travail. Sinon, n&apos;hésite pas à le lui dire, ou à le dire à la coordination.</p>
            </Bloc>
            <Bloc niveau="h3" icone={Scale} titre="Une plainte">
              <p>Tu peux porter plainte contre un prof auprès de la direction des études. Si tu as besoin d&apos;aide dans la démarche, parles-en à la coordination.</p>
            </Bloc>
            <Bloc niveau="h3" icone={Bug} titre="Un problème technique">
              <p>
                Ton code, ton infrastructure : ta ressource principale est ton prof. Tu peux aussi aller au <Link href="/centre-aide" className="text-primary underline">centre d&apos;aide</Link>, où un autre prof du département peut t&apos;aider.
              </p>
            </Bloc>
          </div>
          <p className="text-sm text-muted-foreground">
            Un objet perdu ? Voir les <Link href="/nouveau" className="text-primary underline">conseils aux nouveaux</Link>.
          </p>
        </section>
      </Conteneur>
    </>
  );
}

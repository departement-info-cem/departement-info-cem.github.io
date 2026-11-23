import type { Metadata } from "next";
import { Archive, Clock, FolderTree, HardDrive, Laptop, Search } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { Apparition } from "@/components/apparition";

export const metadata: Metadata = { title: "Conseils aux nouveaux étudiants" };

function Bloc({ icone: Icone, titre, children }: { icone: typeof Clock; titre: string; children: React.ReactNode }) {
  return (
    <Apparition>
      <section className="h-full rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
          <Icone className="size-5 text-primary" /> {titre}
        </h2>
        <div className="space-y-2 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
      </section>
    </Apparition>
  );
}

export default function PageNouveau() {
  return (
    <>
      <TitrePage titre="Conseils aux nouveaux étudiants" sousTitre="Tu vas passer 3 ans au département : voici ce qu'on aurait aimé savoir en arrivant." />
      <Conteneur className="grid gap-6 md:grid-cols-2">
        <Bloc icone={FolderTree} titre="Travaux et notes">
          <p>Ça représente beaucoup de travaux et de documents que tu devrais conserver. Structure de dossiers suggérée :</p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm">{`college/
  Automne2026/
    420-1P6/
      semaine1/
      TP1/
        TP1-v1.zip
        TP1-v2.zip
  Hiver2027/`}</pre>
        </Bloc>
        <Bloc icone={Clock} titre="Travaux">
          <ul>
            <li>Commence dès que possible à lire l&apos;énoncé du travail.</li>
            <li>Identifie les morceaux que tu ne sais pas faire, pour avoir le temps de poser tes questions au prof.</li>
            <li>Sauvegarde plusieurs versions : dès que tu as gagné des points, fais un nouveau commit ou un nouveau ZIP.</li>
            <li>Si le travail est remis sur Léa, fais des remises au fil de tes progrès (le prof prendra la dernière version).</li>
          </ul>
        </Bloc>
        <Bloc icone={HardDrive} titre="Sauvegardes">
          <ul>
            <li>Ta clé USB ou ton disque n&apos;est pas infaillible.</li>
            <li>Prends l&apos;habitude de pousser ton code sur GitHub et de copier tes fichiers sur ton ordi à la maison.</li>
          </ul>
        </Bloc>
        <Bloc icone={Search} titre="Objets perdus">
          <ul>
            <li>Perdu ou trouvé un manteau, un sac... : va à la sécurité, le local vitré au bout du couloir.</li>
            <li>Perdu un disque dur externe ou une clé USB : va au bureau de la coordination.</li>
            <li>Trouvé un disque ou une clé USB : apporte-le à la coordination au E-210. S&apos;il n&apos;y a personne, cherche un prof du département (ils ont les clés).</li>
          </ul>
        </Bloc>
        <Bloc icone={Laptop} titre="Laboratoires">
          <ul>
            <li>Tu cherches un poste et il y a un cours dans le local ? Demande au prof si tu peux utiliser un poste libre, et travaille en silence.</li>
            <li>Les labos sont réservés en priorité aux étudiants du département et aux activités des cours. Si tu fais autre chose et qu&apos;un étudiant a besoin de travailler, laisse-lui ta place.</li>
            <li>On ne mange pas dans les labos.</li>
            <li>On peut boire, mais seulement dans un contenant hermétique (à l&apos;envers, ça ne coule pas).</li>
          </ul>
        </Bloc>
        <Bloc icone={Archive} titre="Disponibilités">
          <p>
            Tous les profs t&apos;offrent des heures de disponibilité en dehors des cours : elles sont affichées sur leur page. Utilise-les, ce sont des experts du domaine. Tes camarades viennent souvent de découvrir ce qu&apos;ils t&apos;expliquent, ce n&apos;est pas toujours fiable.
          </p>
        </Bloc>
      </Conteneur>
    </>
  );
}

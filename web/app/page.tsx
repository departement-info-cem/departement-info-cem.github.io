import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, FileWarning, GitBranch, GraduationCap, Network, Package, Sparkles, Users } from "lucide-react";
import { bot, laboratoires, profs, profsHoraire, programmes, sitesCours } from "@/lib/donnees";
import { FILTRES_SITES, GRILLES_DIRECTES } from "@/lib/raccourcis";
import { EnCeMoment } from "@/components/en-ce-moment";
import { ListeSites } from "@/components/liste-sites";
import { chemin } from "@/lib/chemins";
import { BotOrientation } from "@/components/bot-orientation";
import { Apparition } from "@/components/apparition";
import { AvatarProf } from "@/components/carte-prof";
import { StatutProf } from "@/components/statut-prof";
import { bouton } from "@/lib/bouton";

// Mosaïque de photos : la grande et la verticale occupent deux rangées, les autres comblent les trous.
// Sur téléphone, les quatre premières suffisent (elles forment déjà un rectangle complet).
const PHOTOS = [
  { fichier: "gang.jpg", alt: "Un groupe d'étudiants au laboratoire", tuile: "col-span-2 row-span-2" },
  { fichier: "tablo.jpg", alt: "Explications au tableau blanc", tuile: "" },
  { fichier: "hugo.jpg", alt: "Un étudiant concentré devant son écran", tuile: "row-span-2", cadrage: "object-[center_20%]" },
  { fichier: "blond.jpg", alt: "Discussion entre étudiants au laboratoire", tuile: "" },
  { fichier: "jo-jm.jpg", alt: "Deux profs du département", tuile: "max-md:hidden" },
  { fichier: "grimace.jpg", alt: "Deux étudiants qui font des grimaces", tuile: "max-md:hidden" },
  { fichier: "home.jpg", alt: "Un laboratoire du département", tuile: "max-md:hidden" },
  { fichier: "college.jpg", alt: "Le cégep vu de la pelouse", tuile: "max-md:hidden" },
];

const ICONES_PROGRAMMES: Record<string, typeof Code2> = {
  "dec-prog": Code2,
  "dec-reseau": Network,
  "dec-bac": GraduationCap,
  "aec-web": BookOpen,
  "aec-reseaux": BookOpen,
};

export default function Accueil() {
  const listeProfs = profs();
  const listeProgrammes = programmes();
  const nbCours420 = new Set(listeProgrammes.flatMap((p) => p.sessions.flatMap((s) => s.cours.filter((c) => c.departement).map((c) => c.no)))).size;

  return (
    <>
      {/* ---------- Bandeau principal ---------- */}
      <section className="relative overflow-hidden bg-cem-marine text-white">
        <Image src={chemin("/images/college.jpg")} alt="" fill priority className="object-cover opacity-20" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-cem-marine via-cem-marine/90 to-cem-marine/40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-cem-ciel">Département d&apos;informatique</p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Fais de l&apos;informatique <span className="text-cem-vert">ton métier</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-cem-gris-1">
              Programmation d&apos;applications, réseaux et cybersécurité au Cégep Édouard-Montpetit : un DEC technique en 3 ans, un DEC-BAC en 5 ans avec l&apos;Université de Sherbrooke, et des AEC pour adultes.
            </p>
            <p className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-cem-gris-2">Les grilles de cours</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {GRILLES_DIRECTES.map((g) => (
                <Link key={g.href} href={g.href} className="group rounded-lg bg-cem-vert p-3 text-cem-marine shadow transition hover:-translate-y-0.5 hover:brightness-110">
                  <span className="flex items-center justify-between text-lg font-bold">
                    {g.texte} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                  <span className="text-xs opacity-85">{g.sousTitre}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link href="/sites" className="font-semibold text-cem-vert hover:underline">Sites web des cours</Link>
              <Link href="/maintenant" className="font-semibold text-cem-vert hover:underline">Locaux</Link>
              <Link href="/programmes" className="font-semibold text-cem-vert hover:underline">AEC et autres programmes</Link>
            </div>
          </div>
          <div id="bot">
            <BotOrientation bot={bot()} compact />
          </div>
        </div>
      </section>

      {/* ---------- Accès directs pour les étudiants ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-bold">Sites web des cours</h2>
        <ListeSites sites={sitesCours()} filtres={FILTRES_SITES} />
      </section>
      <section className="border-t bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold">Locaux</h2>
            <Link href="/maintenant" className="text-sm font-semibold text-primary underline">Horaire des laboratoires</Link>
          </div>
          <EnCeMoment profs={profsHoraire()} labos={laboratoires()} compact />
        </div>
      </section>

      {/* ---------- Chiffres ---------- */}
      <section className="border-b bg-muted">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-center md:grid-cols-4">
          {[
            [String(listeProfs.length), "profs passionnés"],
            [String(nbCours420), "cours d'informatique"],
            ["24", "postes par laboratoire"],
            ["2", "profils : programmation et réseau"],
          ].map(([n, t]) => (
            <div key={t}>
              <div className="text-3xl font-bold text-primary">{n}</div>
              <div className="text-sm text-muted-foreground">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Programmes ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-bold">Nos programmes</h2>
        <p className="mb-6 text-muted-foreground">Des grilles de cours présentées de la même façon, pour comparer facilement.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listeProgrammes.map((p, i) => {
            const Icone = ICONES_PROGRAMMES[p.id] ?? BookOpen;
            return (
              <Apparition key={p.id} delai={i * 70}>
                <Link href={`/programmes/${p.id}`} className="group flex h-full gap-4 rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icone className="size-6" />
                  </span>
                  <span>
                    <span className="block font-bold group-hover:text-primary">{p.court}</span>
                    <span className="block text-sm text-muted-foreground">{p.duree.split(/ ?[,(]/)[0]}</span>
                    <span className="mt-1 block text-sm">{p.resume.split(".")[0]}.</span>
                  </span>
                </Link>
              </Apparition>
            );
          })}
          <Link href="/cours-service" className="group flex h-full gap-4 rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Sparkles className="size-6" />
            </span>
            <span>
              <span className="block font-bold group-hover:text-primary">Sciences de la nature et cours de service</span>
              <span className="mt-1 block text-sm">Programmation en sciences (SN1), TIM, TAG et cours à option Z03.</span>
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- Photos ---------- */}
      <section className="bg-cem-marine" aria-label="Photos du département">
        <div className="mx-auto grid max-w-6xl auto-rows-[7rem] grid-cols-2 gap-2 px-4 py-8 sm:auto-rows-[9rem] md:grid-cols-4 md:gap-3 lg:auto-rows-[10rem]">
          {PHOTOS.map((p) => (
            <div key={p.fichier} className={`relative overflow-hidden rounded-md ${p.tuile}`}>
              <Image src={chemin(`/images/${p.fichier}`)} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className={`object-cover ${p.cadrage ?? ""}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Profs ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold">Les profs</h2>
            <p className="text-muted-foreground">Leur horaire, leurs disponibilités et leur calendrier sont en ligne.</p>
          </div>
          <Link href="/profs" className={bouton({ variant: "outline" })}>
            <Users className="size-4" /> Tous les profs
          </Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {listeProfs
            .filter((p) => p.photo)
            .map((p) => (
              <Link key={p.id} href={`/${p.id}`} className="group flex w-24 flex-col items-center gap-1 text-center" title={p.nom}>
                <span className="rounded-full ring-2 ring-transparent transition group-hover:ring-primary">
                  <AvatarProf prof={p} taille={80} />
                </span>
                <span className="text-xs font-medium leading-tight">{p.nom}</span>
                <StatutProf prof={p} compact />
              </Link>
            ))}
        </div>
      </section>

      {/* ---------- Déjà étudiant ---------- */}
      <section className="bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-6 text-3xl font-bold">Déjà au département ?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/nouveau", icone: Sparkles, titre: "Conseils aux nouveaux", texte: "Sauvegardes, labos, objets perdus..." },
              { href: "/logiciels", icone: Package, titre: "Logiciels gratuits", texte: "GitHub Student Pack, JetBrains, Office..." },
              { href: "/git", icone: GitBranch, titre: "Git et commits", texte: "Les règles pour tes dépôts de travaux." },
              { href: "/plagiat", icone: FileWarning, titre: "Plagiat et IA", texte: "S'aider oui, tricher non." },
            ].map((l, i) => (
              <Apparition key={l.href} delai={i * 70}>
                <Link href={l.href} className="group block h-full rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary">
                  <l.icone className="mb-2 size-6 text-primary" />
                  <span className="block font-bold group-hover:text-primary">{l.titre}</span>
                  <span className="text-sm text-muted-foreground">{l.texte}</span>
                </Link>
              </Apparition>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

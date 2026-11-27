import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Backpack, Briefcase, ChevronDown, Code2, FilePen, Gamepad2, GraduationCap, Network, School } from "lucide-react";
import { bot, faq, idsProfsActifs, profs, programmes } from "@/lib/donnees";
import { ETUDIANT_D_UN_JOUR, PORTES_OUVERTES, STAGES } from "@/lib/raccourcis";
import { chemin } from "@/lib/chemins";
import { BotOrientation } from "@/components/bot-orientation";
import { AvatarProf } from "@/components/carte-prof";
import { DateAVenir } from "@/components/date-a-venir";
import { CartesJeux } from "@/components/jeux/cartes-jeux";

// L'accueil s'adresse aux futurs étudiants et à leurs parents. L'étudiant inscrit a le menu
// (sites des cours, profs, locaux, calendrier) et la recherche de l'en-tête, qui trouve aussi le site de chaque cours.

// La barre de chaque parcours est proportionnelle à sa durée (sur 5 ans) ; l'année du stage est en vert.
const PARCOURS = [
  { id: "dec-prog", icone: Code2, etiquette: "DEC technique · 3 ans", titre: "Développement d'applications", ans: 3, stage: true, note: "Stage en entreprise à la dernière session", apres: ["Marché du travail", "ou université"], jeu: { href: "/jeux/programmation", texte: "Essayer : programme un robot" } },
  { id: "dec-reseau", icone: Network, etiquette: "DEC technique · 3 ans", titre: "Réseaux et cybersécurité", ans: 3, stage: true, note: "Stage en entreprise à la dernière session", apres: ["Marché du travail", "ou université"], jeu: { href: "/jeux/reseau", texte: "Essayer : répare un réseau" } },
  { id: "dec-bac", icone: GraduationCap, etiquette: "DEC-BAC avec l'Université de Sherbrooke · 5 ans", titre: "DEC + baccalauréat en informatique", ans: 5, stage: false, note: "3 sessions par année, avec des stages", apres: ["DEC et baccalauréat"], jeu: undefined },
];

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

const VISITE = [
  {
    icone: School,
    titre: "Portes ouvertes",
    date: PORTES_OUVERTES,
    texte: "Visite les labos, rencontre les profs et les étudiants, et pose tes questions.",
    lien: "Tous les détails",
    href: "https://www.cegepmontpetit.ca/choisir-edouard/explorer-cegep/portes-ouvertes",
  },
  {
    icone: Backpack,
    titre: "Étudiant d'un jour",
    date: ETUDIANT_D_UN_JOUR,
    texte: "Passe une demi-journée dans le programme, avec les profs et les étudiants.",
    lien: "S'inscrire",
    href: "https://www.cegepmontpetit.ca/choisir-edouard/explorer-cegep/etudiant-dun-jour",
  },
  {
    icone: FilePen,
    titre: "Demande d'admission",
    texte: "Elle se fait en ligne, sur le site du SRAM. Pour la rentrée d'automne, le premier tour se termine le 1er mars.",
    lien: "Aller au SRAM",
    href: "https://www.sram.qc.ca",
  },
];

export default function Accueil() {
  const actifs = idsProfsActifs();
  const listeProfs = profs().filter((p) => actifs.includes(p.id));
  const parId = Object.fromEntries(programmes().map((p) => [p.id, p]));
  const questions = faq()
    .filter((q) => q.categories.includes("futurs étudiants"))
    .slice(0, 6);

  return (
    <>
      {/* ---------- Bandeau principal : un message, deux actions ---------- */}
      <section className="relative overflow-hidden bg-cem-marine text-white">
        <Image src={chemin("/images/college.jpg")} alt="" fill priority className="object-cover opacity-20" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-cem-marine via-cem-marine/90 to-cem-marine/40" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-cem-ciel">Cégep Édouard-Montpetit · Longueuil</p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Fais de l&apos;informatique <span className="text-cem-vert">ton métier</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-cem-gris-1">
              Programmation, réseaux, cybersécurité : un DEC technique de 3 ans pour travailler dès la fin, ou un DEC-BAC de 5 ans avec l&apos;Université de Sherbrooke.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#parcours" className="inline-flex h-12 items-center gap-2 rounded-lg bg-cem-vert px-5 font-bold text-cem-marine shadow transition hover:brightness-110">
                Voir les trois parcours <ArrowDown className="size-4" />
              </a>
              <a href="#visite" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/40 px-5 font-bold text-white transition hover:bg-white/10">
                Venir nous visiter
              </a>
            </div>
            {/* Pour les entreprises : peu de visiteurs, donc une ligne en retrait plutôt qu'un bouton. */}
            <a href={STAGES} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm text-cem-gris-1 hover:text-white hover:underline">
              <Briefcase className="size-4" /> Entreprises : offrir un stage à nos finissants
            </a>
          </div>
          <div id="bot">
            <BotOrientation bot={bot()} compact />
          </div>
        </div>
      </section>

      {/* ---------- Les trois parcours ---------- */}
      <section id="parcours" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-bold">Trois parcours</h2>
        <p className="mt-1 text-muted-foreground">Le choix dépend surtout de ce que tu veux faire après le cégep.</p>
        <div className="mt-8 divide-y rounded-xl border bg-card shadow-sm">
          {PARCOURS.map((c) => (
            <div key={c.id} className="grid gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-10">
              <div className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <c.icone className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.etiquette}</p>
                  <h3 className="text-xl font-bold">{c.titre}</h3>
                  <p className="mt-1 text-sm">{parId[c.id]?.resume}</p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                    <Link href={`/programmes/${c.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                      Voir la grille de cours <ArrowRight className="size-3.5" />
                    </Link>
                    {c.jeu && (
                      <Link href={c.jeu.href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        <Gamepad2 className="size-4" /> {c.jeu.texte}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex gap-1" style={{ width: `${(c.ans / 5) * 100}%` }} aria-hidden>
                  {Array.from({ length: c.ans }, (_, i) => (
                    <div key={i} className={`flex-1 rounded py-2 text-center text-xs font-bold ${c.stage && i === c.ans - 1 ? "bg-cem-vert text-cem-marine" : "bg-accent text-accent-foreground"}`}>
                      An {i + 1}
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{c.note}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Et après :</span>
                  {c.apres.map((a) => (
                    <span key={a} className="rounded-full border px-3 py-1 font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Adulte ou déjà diplômé ? Les AEC se donnent le soir :{" "}
          <Link href="/programmes/aec-web" className="font-semibold text-primary hover:underline">AEC Web</Link> (19 mois) et{" "}
          <Link href="/programmes/aec-reseaux" className="font-semibold text-primary hover:underline">AEC Réseaux</Link> (18 mois).{" "}
          <Link href="/programmes" className="font-semibold text-primary hover:underline">Tous les programmes</Link>
        </p>
      </section>

      {/* ---------- À quoi ça ressemble : les photos et les visages ---------- */}
      {/* ---------- Les mini-jeux : goûter à la programmation et au réseau avant de choisir ---------- */}
      <section id="jeux" className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-bold">
              <Gamepad2 className="size-8 text-primary" /> Essaie avant de choisir
            </h2>
            <p className="mt-1 text-muted-foreground">Deux petits jeux, cinq niveaux chacun, sans rien connaître d&apos;avance. Si tu y prends plaisir, c&apos;est bon signe.</p>
          </div>
          <Link href="/jeux" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Tous les jeux <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-6">
          <CartesJeux />
        </div>
      </section>

      <section className="bg-cem-marine text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-bold text-white">À quoi ça ressemble</h2>
          <p className="mt-1 text-cem-gris-1">Des laboratoires de 24 postes, des travaux d&apos;équipe et un projet de fin d&apos;études.</p>
          <div className="mt-6 grid auto-rows-[7rem] grid-cols-2 gap-2 sm:auto-rows-[9rem] md:grid-cols-4 md:gap-3 lg:auto-rows-[10rem]">
            {PHOTOS.map((p) => (
              <div key={p.fichier} className={`relative overflow-hidden rounded-md ${p.tuile}`}>
                <Image src={chemin(`/images/${p.fichier}`)} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className={`object-cover ${p.cadrage ?? ""}`} />
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-2xl font-bold text-white">{listeProfs.length} profs</h3>
              <p className="text-cem-gris-1">Leur horaire, leurs disponibilités et leur bureau sont en ligne.</p>
            </div>
            <Link href="/profs" className="inline-flex items-center gap-1 font-semibold text-cem-vert hover:underline">
              Tous les profs <ArrowRight className="size-4" />
            </Link>
          </div>
          {/* Sur téléphone, une douzaine de visages suffit : le lien mène aux autres. */}
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-4">
            {listeProfs
              .filter((p) => p.photo)
              .map((p, i) => (
                <Link key={p.id} href={`/${p.id}`} className={`group flex w-20 flex-col items-center gap-1 text-center ${i >= 12 ? "max-md:hidden" : ""}`}>
                  <span className="rounded-full ring-2 ring-transparent transition group-hover:ring-cem-vert">
                    <AvatarProf prof={p} taille={64} />
                  </span>
                  <span className="text-[11px] leading-tight text-cem-gris-1 group-hover:text-white">{p.nom}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ---------- Les questions des futurs étudiants (catégorie « futurs étudiants » de data/faq.yaml) ---------- */}
      <section className="bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-bold">Les questions qu&apos;on nous pose</h2>
          <p className="mt-1 text-muted-foreground">Des parents autant que des élèves.</p>
          <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
            {questions.map((q, i) => (
              <details key={q.question} open={i < 2} className="group rounded-lg border bg-card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {q.question}
                  <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{q.reponse}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="mt-5 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            Toutes les questions <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ---------- La prochaine étape ---------- */}
      <section id="visite" className="bg-cem-vert text-cem-marine">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-bold text-cem-marine">Viens voir par toi-même</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {VISITE.map((c) => (
              <div key={c.titre} className="flex flex-col rounded-lg bg-cem-marine p-5 text-white shadow">
                <c.icone className="mb-2 size-6 text-cem-vert" />
                <h3 className="text-lg font-bold text-white">{c.titre}</h3>
                {c.date && (
                  <DateAVenir iso={c.date.iso}>
                    <p className="text-sm font-semibold text-cem-vert">{c.date.texte}</p>
                  </DateAVenir>
                )}
                <p className="mt-1 flex-1 text-sm text-cem-gris-1">{c.texte}</p>
                <a href={c.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cem-vert hover:underline">
                  {c.lien} <ArrowRight className="size-3.5" />
                </a>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm">
            Une autre question ?{" "}
            <Link href="/contact" className="font-bold underline">
              Écris-nous
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

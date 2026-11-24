import type { ElementRecherche } from "@/components/recherche-globale";
import { SHAREPOINT, STAGES } from "@/lib/raccourcis";
import { catalogue, faq, laboratoires, profs, programmes } from "@/lib/donnees";
import { normaliserLocal } from "@/lib/maintenant";

const PAGES: ElementRecherche[] = [
  { type: "page", titre: "SharePoint du département", href: SHAREPOINT, motsCles: "profs documents teams" },
  { type: "page", titre: "Sites web des cours", href: "/sites", motsCles: "notes de cours materiel" },
  { type: "page", titre: "Locaux : profs disponibles et laboratoires libres", href: "/maintenant", motsCles: "labo local dispo" },
  { type: "page", titre: "Calendrier scolaire", href: "/calendrier", motsCles: "relache conge JR EC examen session" },
  { type: "page", titre: "Sciences de la nature et cours de service", href: "/cours-service", motsCles: "sciences nature SN1 TIM TAG 905 964 983 Z03" },
  { type: "page", titre: "Mini-jeux de logique : programmation et réseau", href: "/jeux", motsCles: "test python ping robot" },
  { type: "page", titre: "Conseils aux nouveaux étudiants", href: "/nouveau", motsCles: "sauvegarde objets perdus laboratoires dispo" },
  { type: "page", titre: "Logiciels gratuits", href: "/logiciels", motsCles: "github education pack jetbrains office vmware visual studio" },
  { type: "page", titre: "Git et commits", href: "/git", motsCles: "depot repo commit" },
  { type: "page", titre: "Plagiat et IA", href: "/plagiat", motsCles: "triche chatgpt copilot" },
  { type: "page", titre: "Nous joindre", href: "/contact", motsCles: "courriel coordination" },
  { type: "page", titre: "Entreprises : offrir un stage", href: STAGES, motsCles: "stage stagiaire employeur recruter finissant emploi offre" },
  { type: "page", titre: "L'informatique, est-ce pour moi ?", href: "/orientation", motsCles: "bot orientation choisir" },
  { type: "page", titre: "Profs : modifier ma page", href: "/modifier-mon-profil", motsCles: "horaire calendrier yaml" },
];

export function indexRecherche(): ElementRecherche[] {
  const programmesParCours = new Map<string, string[]>();
  for (const p of programmes())
    for (const s of p.sessions)
      for (const c of s.cours) if (c.no) programmesParCours.set(c.no, [...(programmesParCours.get(c.no) ?? []), p.court]);

  return [
    ...profs().map((p) => ({
      type: "prof" as const,
      titre: p.nom,
      sousTitre: [p.bureau && `Bureau ${p.bureau}`, p.cours?.join(", ")].filter(Boolean).join(" · "),
      href: `/${p.id}`,
      motsCles: p.courriel,
      photo: p.photo,
    })),
    ...programmes().map((p) => ({ type: "programme" as const, titre: p.nom, sousTitre: p.duree, href: `/programmes/${p.id}`, motsCles: `${p.court} ${p.code ?? ""}` })),
    ...catalogue().map((c) => {
      const dans = [...new Set(programmesParCours.get(c.no) ?? [])];
      const prog = programmes().find((p) => p.sessions.some((s) => s.cours.some((x) => x.no === c.no)));
      return {
        type: "cours" as const,
        titre: `${c.no} ${c.nom}`,
        sousTitre: dans.join(", "),
        href: c.url ?? (prog ? `/programmes/${prog.id}` : "/programmes"),
        motsCles: `${(c.tags ?? []).join(" ")} ${(c.alias ?? []).map((a) => `${a.no} ${a.nom ?? ""}`).join(" ")}`,
      };
    }),
    ...faq().map((q) => ({ type: "faq" as const, titre: q.question, sousTitre: q.categories.join(", "), href: "/faq", motsCles: q.reponse })),
    ...PAGES,
    ...laboratoires().map((l) => ({ type: "page" as const, titre: `Laboratoire ${l.local}`, sousTitre: l.postes ? `${l.postes} postes` : undefined, href: `/locaux/${l.local}`, motsCles: `labo local horaire ${normaliserLocal(l.local)}` })),
  ];
}

import { agendasDesGroupes, texteAgenda } from "@/lib/agenda";
import { calendrierScolaire, donneesMesCours } from "@/lib/donnees";

// L'agenda d'un groupe : /react/agenda/A2026-5N6-1020.ics, un fichier par groupe généré au build (voir lib/agenda.ts).
// Les étudiants s'y abonnent depuis la page « Mes cours » ; chaque déploiement le met à jour.
export const dynamic = "force-static";
export const dynamicParams = false;

const agendas = () => agendasDesGroupes(donneesMesCours(), calendrierScolaire());

export function generateStaticParams() {
  return [...agendas().keys()].map((fichier) => ({ fichier }));
}

export async function GET(_requete: Request, { params }: RouteContext<"/agenda/[fichier]">) {
  const agenda = agendas().get((await params).fichier);
  if (!agenda) return new Response("Agenda introuvable", { status: 404 });
  return new Response(texteAgenda(agenda.nom, agenda.evenements, new Date()), { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
}

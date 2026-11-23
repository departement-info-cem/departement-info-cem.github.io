import {
  Binary, Bot, Brain, Briefcase, Calculator, Code, Cpu, Database, FileSpreadsheet, GitBranch, Globe, HelpCircle,
  Lightbulb, type LucideIcon, Monitor, Network, Palette, Server, Shapes, Shield, Smartphone, Sprout, Terminal,
} from "lucide-react";

// Tags des cours (data/cours.yaml) -> icône et libellé. Remplace les icônes FontAwesome de l'ancien site.
const ICONES: Record<string, LucideIcon> = {
  bureautique: FileSpreadsheet,
  os: Monitor,
  prog: Code,
  reseau: Network,
  maths: Calculator,
  bd: Database,
  git: GitBranch,
  python: Terminal,
  web: Globe,
  serveurs: Server,
  pro: Briefcase,
  securite: Shield,
  mobile: Smartphone,
  automatisation: Bot,
  design: Palette,
  ia: Brain,
  algo: Binary,
  graphisme: Shapes,
  solutions: Lightbulb,
  choix: HelpCircle,
  fg: Sprout,
};

export const LIBELLES_TAGS: Record<string, string> = {
  bureautique: "Bureautique",
  os: "Systèmes d'exploitation",
  prog: "Programmation",
  reseau: "Réseau",
  maths: "Maths",
  bd: "Bases de données",
  git: "Git",
  python: "Python",
  web: "Web",
  serveurs: "Serveurs",
  pro: "Professionnel",
  securite: "Sécurité",
  mobile: "Mobile",
  automatisation: "Automatisation",
  design: "Design",
  ia: "IA",
  algo: "Algorithmique",
  graphisme: "Graphisme",
  solutions: "Solutions",
  choix: "Au choix",
  fg: "Formation générale",
};

export function IconeTag({ tag, className }: { tag: string; className?: string }) {
  const Icone = ICONES[tag] ?? Cpu;
  return <Icone className={className} aria-label={LIBELLES_TAGS[tag] ?? tag} />;
}

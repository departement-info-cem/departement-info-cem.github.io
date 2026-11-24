import Link from "next/link";
import { FormesPiedDePage } from "@/components/formes-pied-de-page";
import { Logo } from "@/components/logo";
import { DEPOT } from "@/lib/chemins";

export function PiedDePage() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-cadre text-cadre-texte">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <Logo inverse taille={36} />
          <p className="text-sm text-white/75">
            Département d&apos;informatique
            <br />
            945, chemin de Chambly, Longueuil
          </p>
          <a href="mailto:coordination.info@cegepmontpetit.ca" className="text-sm font-semibold text-cem-vert hover:underline">
            coordination.info@cegepmontpetit.ca
          </a>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Le département</h2>
          <ul className="space-y-1 text-sm text-white/80">
            <li><Link href="/programmes" className="hover:underline">Programmes et grilles de cours</Link></li>
            <li><Link href="/profs" className="hover:underline">Les profs</Link></li>
            <li><Link href="/orientation" className="hover:underline">L&apos;informatique, est-ce pour moi ?</Link></li>
            <li><Link href="/faq" className="hover:underline">Foire aux questions</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Liens</h2>
          <ul className="space-y-1 text-sm text-white/80">
            <li><a href="https://www.cegepmontpetit.ca" target="_blank" rel="noreferrer" className="hover:underline">Cégep Édouard-Montpetit</a></li>
            <li><a href="https://cegepmontpetit.omnivox.ca/" target="_blank" rel="noreferrer" className="hover:underline">Omnivox</a></li>
            <li><a href="https://www.adeptinfo.ca" target="_blank" rel="noreferrer" className="hover:underline">ADEPT, l&apos;association étudiante</a></li>
            <li><Link href="/modifier-mon-profil" className="hover:underline">Profs : modifier ma page</Link></li>
            <li><a href={DEPOT} target="_blank" rel="noreferrer" className="hover:underline">Code source du site</a></li>
          </ul>
        </div>
      </div>
      {/* Sur un écran étroit, le copyright passe à gauche pour laisser la place aux formes.
          Pas de filet au-dessus : il traverserait les formes. */}
      <div className="py-4 pr-34 pl-4 text-xs text-white/60 md:px-4 md:text-center">
        © {new Date().getFullYear()} Département d&apos;informatique du Cégep Édouard-Montpetit
      </div>
      <FormesPiedDePage />
    </footer>
  );
}

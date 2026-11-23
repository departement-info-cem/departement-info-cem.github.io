import Link from "next/link";
import { bouton } from "@/lib/bouton";

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-mono text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-muted-foreground">Segmentation fault (core dumped)... ou plus simplement, cette page n&apos;existe pas.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className={bouton()}>Accueil</Link>
        <Link href="/profs" className={bouton({ variant: "outline" })}>Les profs</Link>
      </div>
    </div>
  );
}

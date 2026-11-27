"use client";
import { useState } from "react";
import { Ellipsis, EllipsisVertical, Menu, Share, Smartphone, SquarePlus } from "lucide-react";
import { useInstallation } from "@/app/_hooks/use-installation";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { bouton } from "@/lib/bouton";

// « Ajouter à l'écran d'accueil » : le site s'ouvre ensuite comme une appli, sans barre d'adresse (app/manifest.ts).
// Entrée du menu sur mobile (components/entete.tsx) et carte sur la page « Mes cours ».
// Android : la fenêtre d'installation du navigateur, s'il l'offre. Sinon (iPhone, Firefox...) : les gestes à faire.

const ICONE = "inline size-4 align-text-bottom";

/** Les gestes à faire quand le navigateur n'offre pas d'installer le site lui-même. */
export function AideInstallation({ ouvert, changer }: { ouvert: boolean; changer: (o: boolean) => void }) {
  const { plateforme } = useInstallation();
  const { mesCours, apercu } = useMesCours();

  return (
    <Dialog open={ouvert} onOpenChange={changer}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Ajouter à l&apos;écran d&apos;accueil</DialogTitle>
        <DialogDescription>Le site s&apos;ouvrira d&apos;un geste, comme une appli.</DialogDescription>
        {plateforme === "ios" ? (
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Touche le bouton Partager <Share className={ICONE} />. Dans Safari, il est parfois dans le menu{" "}
              <Ellipsis className={ICONE} />.
            </li>
            <li>Choisis « Sur l&apos;écran d&apos;accueil ». S&apos;il n&apos;y est pas, fais défiler la liste.</li>
            <li>Touche « Ajouter ».</li>
          </ol>
        ) : (
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Ouvre le menu du navigateur : <EllipsisVertical className={ICONE} /> en haut dans Chrome,{" "}
              <Menu className={ICONE} /> en bas dans Samsung Internet.
            </li>
            <li>Choisis « Ajouter à l&apos;écran d&apos;accueil » ou « Installer l&apos;application ».</li>
            <li>Confirme.</li>
          </ol>
        )}
        {/* L'appli de l'écran d'accueil ne partage pas le stockage de Safari */}
        {plateforme === "ios" && mesCours.length > 0 && !apercu && (
          <p className="rounded-md bg-muted p-3 text-sm">Sur iPhone, l&apos;appli a sa propre mémoire : à la première ouverture, choisis tes cours de nouveau.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Carte de la page « Mes cours », sur téléphone et tablette seulement. */
export function CarteInstallation() {
  const { proposer, installer } = useInstallation();
  const [aide, setAide] = useState(false);
  if (!proposer) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg border bg-card p-3">
      <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        <p>
          <span className="font-semibold">Sur ton téléphone :</span> ajoute le site à ton écran d&apos;accueil pour retrouver ton horaire et tes profs d&apos;un geste.
        </p>
        <button onClick={async () => (await installer()) || setAide(true)} className={bouton({ variant: "outline", size: "sm" }, "mt-2")}>
          <SquarePlus className="size-4" /> Ajouter à l&apos;écran d&apos;accueil
        </button>
      </div>
      <AideInstallation ouvert={aide} changer={setAide} />
    </div>
  );
}

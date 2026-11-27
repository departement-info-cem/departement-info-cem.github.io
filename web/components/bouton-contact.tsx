"use client";
import { MessageSquare } from "lucide-react";
import type { Prof } from "@/app/_types/prof";
import { bouton } from "@/lib/bouton";

// Le bouton « Écris-moi » de la page d'un prof, selon le champ « contact » de sa fiche.
// Pas d'adresse courriel dans la page publiée (hameçonnage) : les robots qui récoltent les adresses lisent aussi les liens.
// Or le lien vers une conversation Teams exige l'adresse : il est donc assemblé au clic.
// Sans JavaScript, ou en ouvrant le lien autrement (clic du milieu, appui long), on arrive simplement sur Teams.
export function BoutonContact({ courriel, contact }: Pick<Prof, "courriel" | "contact">) {
  const classes = bouton({ variant: "outline", size: "sm" });
  if (contact === "mio") {
    return (
      <span className={classes}>
        <MessageSquare className="size-4" /> Écris-moi sur MIO
      </span>
    );
  }
  return (
    <a
      href="https://teams.microsoft.com/"
      onClick={(e) => {
        e.currentTarget.href = `https://teams.microsoft.com/l/chat/0/0?users=${courriel}@cegepmontpetit.ca`;
      }}
      target="_blank"
      rel="noreferrer"
      className={classes}
    >
      <MessageSquare className="size-4" /> Écris-moi sur Teams
    </a>
  );
}

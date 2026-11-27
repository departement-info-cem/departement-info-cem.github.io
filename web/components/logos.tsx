import Image from "next/image";
import { chemin } from "@/lib/chemins";

// Logos des services, devant le texte des boutons de la page d'un prof (GitHub, LinkedIn, Teams, MIO).
// En SVG dans le code plutôt qu'en image : GitHub prend la couleur du texte, donc reste visible en thème sombre.
type Props = { className?: string };

export function LogoGitHub({ className = "size-4" }: Props) {
  // Tracé de Font Awesome Free (CC BY 4.0), le même que public/images/liens/github.svg
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden className={className}>
      <path d="M173.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM252.8 8c-138.7 0-244.8 105.3-244.8 244 0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1 100-33.2 167.8-128.1 167.8-239 0-138.7-112.5-244-251.2-244zM105.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9s4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
    </svg>
  );
}

export function LogoLinkedIn({ className = "size-4" }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect width="24" height="24" rx="3" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"
      />
    </svg>
  );
}

export function LogoTeams({ className = "size-4" }: Props) {
  // Le logo de Teams simplifié : deux personnes derrière la tuile au T
  return (
    <svg viewBox="0 0 2229 2074" aria-hidden className={className}>
      <circle cx="1944" cy="441" r="233" fill="#5059C9" />
      <path fill="#5059C9" d="M1555 777.5H2130a98.5 98.5 0 0 1 98.5 98.5V1400a362 362 0 0 1-362 362h-1.5a362 362 0 0 1-362-362V829a51.5 51.5 0 0 1 51.5-51.5z" />
      <circle cx="1218" cy="337" r="337" fill="#7B83EB" />
      <path fill="#7B83EB" d="M717 777.5h950a96 99.5 0 0 1 96 99.5v598a570.5 598 0 0 1-1141 0V877a96 99.5 0 0 1 95-99.5z" />
      <rect y="518" width="1037" height="1037" rx="95" fill="#4B53BC" />
      <path fill="#fff" d="M809 912H601.6v564H469.6V912H263.3V802.8H809z" />
    </svg>
  );
}

export function LogoMio({ className = "size-4" }: Props) {
  // MIO, la messagerie d'Omnivox : la fleur d'Omnivox, comme dans le menu des liens de l'en-tête
  return <Image src={chemin("/images/liens/omnivox.png")} alt="" width={16} height={16} unoptimized className={`object-contain ${className}`} />;
}

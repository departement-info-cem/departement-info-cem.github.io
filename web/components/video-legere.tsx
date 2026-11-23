"use client";
import { useState } from "react";
import { Play } from "lucide-react";

// Vidéo YouTube chargée seulement au clic (plus léger et plus respectueux de la vie privée).
export function VideoLegere({ id, titre }: { id: string; titre: string }) {
  const [active, setActive] = useState(false);
  if (active) {
    return <iframe className="aspect-video w-full rounded-lg" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={titre} allow="autoplay; encrypted-media" allowFullScreen />;
  }
  return (
    <button onClick={() => setActive(true)} className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-black" aria-label={`Lire la vidéo : ${titre}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="size-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" loading="lazy" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-cem-rouge text-white shadow-lg transition group-hover:scale-110">
          <Play className="ml-1 size-7 fill-current" />
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-left text-sm font-semibold text-white">{titre}</span>
    </button>
  );
}
